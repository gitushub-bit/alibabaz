-- Create role enum for user roles
create type public.app_role as enum ('admin', 'buyer', 'seller');

-- Create user_roles table for secure role management
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone not null default now(),
    unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Create security definer function to check roles (prevents RLS recursion)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create profiles table
create table public.profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null unique,
    full_name text,
    company_name text,
    phone text,
    avatar_url text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

-- Create suppliers table (extends profiles for sellers)
create table public.suppliers (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null unique,
    company_info text,
    year_established integer,
    employees text,
    main_markets text[],
    certificates text[],
    verified boolean default false,
    response_rate integer default 0,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.suppliers enable row level security;

-- Create categories table
create table public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    image_url text,
    parent_id uuid references public.categories(id) on delete set null,
    created_at timestamp with time zone not null default now()
);

alter table public.categories enable row level security;

-- Create products table
create table public.products (
    id uuid primary key default gen_random_uuid(),
    seller_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    slug text not null unique,
    description text,
    price_min numeric(12,2),
    price_max numeric(12,2),
    moq integer default 1,
    unit text default 'piece',
    images text[],
    category_id uuid references public.categories(id) on delete set null,
    tags text[],
    specifications jsonb,
    verified boolean default false,
    published boolean default false,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.products enable row level security;

-- Create RFQs table (Request for Quotation)
create table public.rfqs (
    id uuid primary key default gen_random_uuid(),
    buyer_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    description text,
    quantity integer,
    unit text,
    category_id uuid references public.categories(id) on delete set null,
    images text[],
    deadline timestamp with time zone,
    status text default 'open' check (status in ('open', 'closed', 'expired')),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.rfqs enable row level security;

-- Create RFQ responses table
create table public.rfq_responses (
    id uuid primary key default gen_random_uuid(),
    rfq_id uuid references public.rfqs(id) on delete cascade not null,
    seller_id uuid references auth.users(id) on delete cascade not null,
    message text,
    price numeric(12,2),
    moq integer,
    delivery_time text,
    attachments text[],
    created_at timestamp with time zone not null default now()
);

alter table public.rfq_responses enable row level security;

-- Create conversations table
create table public.conversations (
    id uuid primary key default gen_random_uuid(),
    buyer_id uuid references auth.users(id) on delete cascade not null,
    seller_id uuid references auth.users(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    last_message_at timestamp with time zone default now(),
    created_at timestamp with time zone not null default now()
);

alter table public.conversations enable row level security;

-- Create messages table
create table public.messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid references public.conversations(id) on delete cascade not null,
    sender_id uuid references auth.users(id) on delete cascade not null,
    content text not null,
    read boolean default false,
    created_at timestamp with time zone not null default now()
);

alter table public.messages enable row level security;

-- Create orders table
create table public.orders (
    id uuid primary key default gen_random_uuid(),
    buyer_id uuid references auth.users(id) on delete cascade not null,
    seller_id uuid references auth.users(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    quantity integer not null,
    total_price numeric(12,2) not null,
    status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    tracking_info jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.orders enable row level security;

-- Create reviews table
create table public.reviews (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references public.orders(id) on delete cascade not null unique,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamp with time zone not null default now()
);

alter table public.reviews enable row level security;

-- Create favorites table
create table public.favorites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete cascade not null,
    created_at timestamp with time zone not null default now(),
    unique(user_id, product_id)
);

alter table public.favorites enable row level security;

-- RLS Policies

-- User roles policies
create policy "Users can view their own roles"
    on public.user_roles for select
    using (auth.uid() = user_id);

create policy "Admins can manage all roles"
    on public.user_roles for all
    using (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
create policy "Profiles are viewable by everyone"
    on public.profiles for select
    using (true);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = user_id);

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = user_id);

-- Suppliers policies
create policy "Suppliers are viewable by everyone"
    on public.suppliers for select
    using (true);

create policy "Sellers can update their own supplier info"
    on public.suppliers for update
    using (auth.uid() = user_id);

create policy "Sellers can insert their own supplier info"
    on public.suppliers for insert
    with check (auth.uid() = user_id);

-- Categories policies
create policy "Categories are viewable by everyone"
    on public.categories for select
    using (true);

create policy "Admins can manage categories"
    on public.categories for all
    using (public.has_role(auth.uid(), 'admin'));

-- Products policies
create policy "Published products are viewable by everyone"
    on public.products for select
    using (published = true or auth.uid() = seller_id);

create policy "Sellers can insert their own products"
    on public.products for insert
    with check (auth.uid() = seller_id and public.has_role(auth.uid(), 'seller'));

create policy "Sellers can update their own products"
    on public.products for update
    using (auth.uid() = seller_id);

create policy "Sellers can delete their own products"
    on public.products for delete
    using (auth.uid() = seller_id);

-- RFQs policies
create policy "Open RFQs are viewable by authenticated users"
    on public.rfqs for select
    using (status = 'open' or auth.uid() = buyer_id);

create policy "Buyers can insert their own RFQs"
    on public.rfqs for insert
    with check (auth.uid() = buyer_id and public.has_role(auth.uid(), 'buyer'));

create policy "Buyers can update their own RFQs"
    on public.rfqs for update
    using (auth.uid() = buyer_id);

-- RFQ responses policies
create policy "RFQ responses viewable by involved parties"
    on public.rfq_responses for select
    using (
        auth.uid() = seller_id or 
        auth.uid() in (select buyer_id from public.rfqs where id = rfq_id)
    );

create policy "Sellers can insert RFQ responses"
    on public.rfq_responses for insert
    with check (auth.uid() = seller_id and public.has_role(auth.uid(), 'seller'));

-- Conversations policies
create policy "Users can view their own conversations"
    on public.conversations for select
    using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Authenticated users can create conversations"
    on public.conversations for insert
    with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Messages policies
create policy "Users can view messages in their conversations"
    on public.messages for select
    using (
        auth.uid() in (
            select buyer_id from public.conversations where id = conversation_id
            union
            select seller_id from public.conversations where id = conversation_id
        )
    );

create policy "Users can insert messages in their conversations"
    on public.messages for insert
    with check (
        auth.uid() = sender_id and
        auth.uid() in (
            select buyer_id from public.conversations where id = conversation_id
            union
            select seller_id from public.conversations where id = conversation_id
        )
    );

create policy "Users can update read status of received messages"
    on public.messages for update
    using (
        auth.uid() in (
            select buyer_id from public.conversations where id = conversation_id
            union
            select seller_id from public.conversations where id = conversation_id
        ) and auth.uid() != sender_id
    );

-- Orders policies
create policy "Users can view their own orders"
    on public.orders for select
    using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Buyers can create orders"
    on public.orders for insert
    with check (auth.uid() = buyer_id);

create policy "Involved parties can update orders"
    on public.orders for update
    using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Reviews policies
create policy "Reviews are viewable by everyone"
    on public.reviews for select
    using (true);

create policy "Order buyers can create reviews"
    on public.reviews for insert
    with check (
        auth.uid() in (select buyer_id from public.orders where id = order_id)
    );

-- Favorites policies
create policy "Users can view their own favorites"
    on public.favorites for select
    using (auth.uid() = user_id);

create policy "Users can manage their own favorites"
    on public.favorites for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
    on public.favorites for delete
    using (auth.uid() = user_id);

-- Trigger for updating timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
    before update on public.profiles
    for each row execute function public.update_updated_at_column();

create trigger update_suppliers_updated_at
    before update on public.suppliers
    for each row execute function public.update_updated_at_column();

create trigger update_products_updated_at
    before update on public.products
    for each row execute function public.update_updated_at_column();

create trigger update_rfqs_updated_at
    before update on public.rfqs
    for each row execute function public.update_updated_at_column();

create trigger update_orders_updated_at
    before update on public.orders
    for each row execute function public.update_updated_at_column();

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    user_role app_role;
begin
    -- Get role from metadata, default to 'buyer'
    user_role := coalesce(
        (new.raw_user_meta_data->>'role')::app_role,
        'buyer'::app_role
    );
    
    -- Insert profile
    insert into public.profiles (user_id, full_name, company_name)
    values (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'company_name'
    );
    
    -- Insert role
    insert into public.user_roles (user_id, role)
    values (new.id, user_role);
    
    -- If seller, create supplier record
    if user_role = 'seller' then
        insert into public.suppliers (user_id)
        values (new.id);
    end if;
    
    return new;
end;
$$;

-- Trigger for new user signup
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;

-- Create storage bucket for product images
insert into storage.buckets (id, name, public) values ('products', 'products', true);
insert into storage.buckets (id, name, public) values ('rfqs', 'rfqs', true);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage policies
create policy "Anyone can view product images"
    on storage.objects for select
    using (bucket_id = 'products');

create policy "Authenticated users can upload product images"
    on storage.objects for insert
    with check (bucket_id = 'products' and auth.role() = 'authenticated');

create policy "Users can update their own product images"
    on storage.objects for update
    using (bucket_id = 'products' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own product images"
    on storage.objects for delete
    using (bucket_id = 'products' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view RFQ images"
    on storage.objects for select
    using (bucket_id = 'rfqs');

create policy "Authenticated users can upload RFQ images"
    on storage.objects for insert
    with check (bucket_id = 'rfqs' and auth.role() = 'authenticated');

create policy "Anyone can view avatars"
    on storage.objects for select
    using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
    on storage.objects for insert
    with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update their own avatar"
    on storage.objects for update
    using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Insert sample categories
insert into public.categories (name, slug, image_url) values
    ('Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200'),
    ('Machinery', 'machinery', 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=200'),
    ('Apparel', 'apparel', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200'),
    ('Home & Garden', 'home-garden', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200'),
    ('Beauty', 'beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200'),
    ('Automotive', 'automotive', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200'),
    ('Sports & Outdoors', 'sports-outdoors', 'https://images.unsplash.com/photo-1461896836934- voices?w=200'),
    ('Food & Beverages', 'food-beverages', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200');