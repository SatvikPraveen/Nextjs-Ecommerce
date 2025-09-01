// Location: components/jsonld.tsx

import { Product, Organization, WebSite, BreadcrumbList } from 'schema-dts';

interface JsonLdProps {
  data: Product | Organization | WebSite | BreadcrumbList | any;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Product structured data
export function ProductJsonLd({
  product,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}: {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    comparePrice?: number | null;
    sku?: string | null;
    images: Array<{ url: string; altText?: string | null }>;
    category?: { name: string } | null;
    reviews?: Array<{ rating: number }>;
  };
  baseUrl?: string;
}) {
  const avgRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : undefined;

  const productData: Product = {
    '@type': 'Product',
    '@id': `${baseUrl}/products/${product.id}`,
    name: product.name,
    description: product.description || undefined,
    image: product.images.map(img => img.url),
    sku: product.sku || undefined,
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/products/${product.id}`,
      ...(product.comparePrice && product.comparePrice > product.price && {
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }),
    },
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews?.length || 0,
        bestRating: '5',
        worstRating: '1',
      },
    }),
  };

  return <JsonLd data={productData} />;
}

// Organization structured data
export function OrganizationJsonLd({
  name = process.env.NEXT_PUBLIC_APP_NAME || 'E-Commerce Store',
  url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  logo,
  contactPoint,
  sameAs,
}: {
  name?: string;
  url?: string;
  logo?: string;
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType?: string;
  };
  sameAs?: string[];
}) {
  const organizationData: Organization = {
    '@type': 'Organization',
    name,
    url,
    logo: logo || `${url}/logo.png`,
    ...(contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: contactPoint.telephone,
        email: contactPoint.email,
        contactType: contactPoint.contactType || 'customer service',
      },
    }),
    ...(sameAs && { sameAs }),
  };

  return <JsonLd data={organizationData} />;
}

// Website structured data
export function WebSiteJsonLd({
  name = process.env.NEXT_PUBLIC_APP_NAME || 'E-Commerce Store',
  url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}: {
  name?: string;
  url?: string;
}) {
  const webSiteData: WebSite = {
    '@type': 'WebSite',
    name,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={webSiteData} />;
}

// Breadcrumb structured data
export function BreadcrumbJsonLd({
  itemListElements,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}: {
  itemListElements: Array<{
    name: string;
    href: string;
  }>;
  baseUrl?: string;
}) {
  const breadcrumbData: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    itemListElement: itemListElements.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.href}`,
    })),
  };

  return <JsonLd data={breadcrumbData} />;
}

// Product list structured data
export function ProductListJsonLd({
  products,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}: {
  products: Array<{
    id: string;
    name: string;
    price: number;
    images: Array<{ url: string }>;
  }>;
  baseUrl?: string;
}) {
  const itemListData = {
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'Product',
      position: index + 1,
      name: product.name,
      image: product.images[0]?.url,
      offers: {
        '@type': 'Offer',
        price: product.price.toString(),
        priceCurrency: 'USD',
        url: `${baseUrl}/products/${product.id}`,
      },
    })),
  };

  return <JsonLd data={itemListData} />;
}

// FAQ structured data
export function FAQJsonLd({
  faqs,
}: {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}) {
  const faqData = {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <JsonLd data={faqData} />;
}