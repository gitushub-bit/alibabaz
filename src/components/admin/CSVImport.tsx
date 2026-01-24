import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import {
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client"; // if storing images in supabase storage

interface CSVImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "products" | "categories";
  requiredColumns: string[];
  optionalColumns?: string[];
  onImport: (
    data: Record<string, string>[]
  ) => Promise<{ success: number; errors: string[] }>;
  sampleData?: Record<string, string>[];
  imageColumn?: string; // Column in CSV that contains image URLs
  skipImageProcessing?: boolean; // If true, skip built-in image download/upload
}

export function CSVImport({
  open,
  onOpenChange,
  type,
  requiredColumns,
  optionalColumns = [],
  onImport,
  sampleData,
  imageColumn = "image", // default
  skipImageProcessing = false, // default: process images
}: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // ---------------------------
  // CSV parser (supports quotes)
  // ---------------------------
  const parseCSV = (text: string) => {
    const rows = text
      .trim()
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean);

    if (!rows.length) return { headers: [], data: [] };

    const splitRow = (row: string) => {
      const result: string[] = [];
      let cur = "";
      let insideQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"' && row[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
          result.push(cur);
          cur = "";
        } else {
          cur += char;
        }
      }
      result.push(cur);
      return result;
    };

    const rawHeaders = splitRow(rows[0]).map((h) =>
      h.trim().toLowerCase().replace(/['"]/g, "")
    );

    const data = rows.slice(1).map((row) => {
      const values = splitRow(row).map((v) => v.trim());
      const obj: Record<string, string> = {};
      rawHeaders.forEach((header, i) => {
        obj[header] = values[i] || "";
      });
      return obj;
    });

    return { headers: rawHeaders, data };
  };

  // -----------------------
  // Drag & Drop file upload
  // -----------------------
  useEffect(() => {
    const dropArea = dropRef.current;
    if (!dropArea) return;

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, []);

  // -------------------
  // Handle file upload
  // -------------------
  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      toast({ title: "Please select a CSV file", variant: "destructive" });
      return;
    }

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers, data } = parseCSV(text);
      setHeaders(headers);
      setParsedData(data);
    };
    reader.readAsText(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  // ----------------------
  // Import handler
  // ----------------------
  const handleImport = async () => {
    if (!parsedData.length) return;

    const missingColumns = requiredColumns.filter(
      (col) => !headers.includes(col.toLowerCase())
    );

    if (missingColumns.length > 0) {
      toast({
        title: "Missing required columns",
        description: `Include: ${missingColumns.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 8, 80));
    }, 250);

    try {
      // -------------------------
      // Download images if any (skip if skipImageProcessing is true)
      // -------------------------
      let dataToImport = parsedData;
      
      if (!skipImageProcessing) {
        dataToImport = await Promise.all(
          parsedData.map(async (row) => {
            if (!row[imageColumn]) return row;

            try {
              const imageUrl = row[imageColumn];
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const fileExt = blob.type.split("/")[1] || "jpg";
              const fileName = `${Date.now()}_${Math.random()
                .toString(36)
                .substring(2)}.${fileExt}`;

              // Upload to Supabase Storage
              const { data: uploadData, error } = await supabase.storage
                .from("product-images")
                .upload(fileName, blob, { cacheControl: "3600", upsert: true });

              if (error) throw error;

              const { data: publicUrl } = supabase.storage
                .from("product-images")
                .getPublicUrl(fileName);

              row[imageColumn] = publicUrl.publicUrl; // replace with uploaded URL
            } catch (err) {
              console.error("Image download failed for row", row, err);
              row[imageColumn] = ""; // reset if fail
            }

            return row;
          })
        );
      }

      // -------------------------
      // Call the user's import handler
      // -------------------------
      const res = await onImport(dataToImport);
      setResult(res);
      setProgress(100);

      toast({
        title: "Import completed",
        description: `${res.success} ${type} imported`,
      });
    } catch (err: any) {
      toast({
        title: "Import failed",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      clearInterval(interval);
      setImporting(false);
    }
  };

  // -----------------------
  // Sample CSV download
  // -----------------------
  const downloadSampleCSV = () => {
    const allColumns = [...requiredColumns, ...optionalColumns];
    const csvContent = [
      allColumns.join(","),
      ...(sampleData || []).map((row) =>
        allColumns.map((col) => row[col] || "").join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sample_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -----------------------
  // Reset
  // -----------------------
  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setResult(null);
    setProgress(0);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import {type === "products" ? "Products" : "Categories"} from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import {type}. Make sure your file includes all required columns. If an image URL is provided, it will be downloaded and stored.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Required Columns */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Required Columns</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {requiredColumns.map((col) => (
                <Badge key={col} variant="default">
                  {col}
                </Badge>
              ))}
            </div>

            {optionalColumns.length > 0 && (
              <>
                <h4 className="font-medium mb-2 mt-4">Optional Columns</h4>
                <div className="flex flex-wrap gap-2">
                  {optionalColumns.map((col) => (
                    <Badge key={col} variant="secondary">
                      {col}
                    </Badge>
                  ))}
                </div>
              </>
            )}

            <Button variant="outline" size="sm" className="mt-4" onClick={downloadSampleCSV}>
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV
            </Button>
          </div>

          {/* Drag & Drop */}
          <div
            ref={dropRef}
            className="border border-dashed border-muted rounded-lg p-4 bg-background/60"
          >
            <div className="flex items-center justify-between">
              <Label>Upload CSV</Label>
              {file && (
                <Button variant="ghost" size="icon" onClick={resetState}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="flex-1" />
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Drag & drop your CSV file here or click to select.
            </p>
          </div>

          {/* Preview */}
          {parsedData.length > 0 && !result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Preview ({parsedData.length} rows)</h4>
                <div className="flex gap-2">
                  {requiredColumns.map((col) => (
                    <Badge
                      key={col}
                      variant={headers.includes(col.toLowerCase()) ? "default" : "destructive"}
                    >
                      {headers.includes(col.toLowerCase()) ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg overflow-x-auto max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.slice(0, 6).map((h) => (
                        <TableHead key={h} className="whitespace-nowrap">
                          {h}
                        </TableHead>
                      ))}
                      {headers.length > 6 && <TableHead>...</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        {headers.slice(0, 6).map((h) => (
                          <TableCell key={h} className="max-w-[150px] truncate">
                            {row[h]}
                          </TableCell>
                        ))}
                        {headers.length > 6 && <TableCell>...</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {parsedData.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  ...and {parsedData.length - 5} more rows
                </p>
              )}
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing (CSV + Images)...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">{result.success} imported successfully</span>
                </div>
                {result.errors.length > 0 && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">{result.errors.length} failed</span>
                  </div>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="bg-destructive/10 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <h5 className="font-medium text-destructive mb-2">Errors:</h5>
                  <ul className="text-sm space-y-1">
                    {result.errors.slice(0, 10).map((err, i) => (
                      <li key={i} className="text-destructive">{err}</li>
                    ))}
                    {result.errors.length > 10 && (
                      <li className="text-muted-foreground">
                        ...and {result.errors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => handleClose(false)}>
              {result ? "Close" : "Cancel"}
            </Button>
            {!result && (
              <Button onClick={handleImport} disabled={!parsedData.length || importing}>
                <Upload className="h-4 w-4 mr-2" />
                {importing ? "Importing..." : `Import ${parsedData.length} ${type}`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
