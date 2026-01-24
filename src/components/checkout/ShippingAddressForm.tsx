import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { countries } from '@/data/countries';

const shippingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z
    .string()
    .min(10, 'Valid phone number is required')
    .regex(/^[0-9+\s()-]+$/, 'Phone number must be numeric'),
  email: z.string().email('Valid email is required'),
  streetAddress: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  stateProvince: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingAddressFormProps {
  onSubmit: (data: ShippingFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ShippingFormData>;
  isSubmitting?: boolean;
}

export default function ShippingAddressForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
}: ShippingAddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: initialData || {},
  });

  const selectedCountry = watch('country');
  const selectedCountryData = countries.find((c) => c.name === selectedCountry);

  return (
    <Card className="shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipping Address
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" placeholder="John Doe" {...register('fullName')} />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <div className="flex gap-2">
                {selectedCountryData && (
                  <div className="flex items-center gap-1 px-3 bg-muted rounded-md border text-sm min-w-[90px]">
                    <span>{selectedCountryData.flag}</span>
                    <span className="text-muted-foreground">{selectedCountryData.dialCode}</span>
                  </div>
                )}
                <Input
                  id="phoneNumber"
                  placeholder="234 567 8900"
                  {...register('phoneNumber')}
                  className="flex-1"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select
              value={selectedCountry}
              onValueChange={(value) => setValue('country', value)}
            >
              <SelectTrigger className="rounded-xl border-2 border-muted/40">
                <SelectValue placeholder="Select country">
                  {selectedCountryData && (
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{selectedCountryData.flag}</span>
                      <span>{selectedCountryData.name}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>

              <SelectContent className="rounded-xl border-2 border-muted/40">
                <ScrollArea className="h-[300px]">
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="text-muted-foreground text-xs ml-1">
                          ({country.dialCode})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>

            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="streetAddress">Street Address *</Label>
            <Input
              id="streetAddress"
              placeholder="123 Main Street, Apt 4B"
              {...register('streetAddress')}
            />
            {errors.streetAddress && (
              <p className="text-sm text-destructive">{errors.streetAddress.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" placeholder="New York" {...register('city')} />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stateProvince">State/Province *</Label>
              <Input id="stateProvince" placeholder="NY" {...register('stateProvince')} />
              {errors.stateProvince && (
                <p className="text-sm text-destructive">{errors.stateProvince.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              placeholder="10001"
              {...register('postalCode')}
              className="md:w-1/2"
            />
            {errors.postalCode && (
              <p className="text-sm text-destructive">{errors.postalCode.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1 rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
