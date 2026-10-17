"use client";

import React from "react";
import { Create } from "@/components/admin/create";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { SelectInput } from "@/components/admin/select-input";
import { ImageUploadInput } from "@/components/admin/image-upload-input";
import { CategoryDynamicFields } from "./CategoryDynamicFields";
import { useWatch } from "react-hook-form";
import { required } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryTemplateField } from "@/lib/categoryTemplates";

const stockChoices = [
  { id: "IN_STOCK", name: "In Stock" },
  { id: "LIMITED", name: "Limited Stock" },
  { id: "OUT_OF_STOCK", name: "Out of Stock" },
];

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  templateFields?: CategoryTemplateField[];
}

const CategoryTemplateSection = ({ categories }: { categories: CategoryItem[] }) => {
  const selectedCategory = useWatch({ name: "category" });
  const matched = categories.find(
    (c) => c.name === selectedCategory || c.id === selectedCategory
  );

  return (
    <CategoryDynamicFields
      categoryName={selectedCategory}
      templateFields={matched?.templateFields || []}
      baseSource="attributes"
    />
  );
};

export const SellerProductCreate = () => {
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(
            data.categories.map((c: any) => ({
              id: c.name,
              name: c.name,
              slug: c.slug,
              templateFields: Array.isArray(c.templateFields)
                ? c.templateFields
                : typeof c.templateFields === "string"
                ? JSON.parse(c.templateFields)
                : [],
            }))
          );
        }
      })
      .catch((err) => console.error("Failed to load categories:", err))
      .finally(() => setLoadingCategories(false));
  }, []);

  return (
    <Create redirect="list">
      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <SimpleForm className="max-w-none space-y-4">
            {/* Fixed core fields (same for every product) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput source="name" label="Product Name *" validate={[required()]} />
              <TextInput source="brand" label="Brand Name" placeholder="e.g. Nike, Zara, Local Artisan" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput source="price" label="Selling Price (₹) *" validate={[required()]} />
              <NumberInput source="mrp" label="MRP / List Price (₹)" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectInput
                source="category"
                label="Category *"
                choices={categories.map((c) => ({ id: c.name, name: c.name }))}
                isLoading={loadingCategories}
                validate={[required()]}
              />
              <SelectInput
                source="stockStatus"
                label="Stock Status"
                choices={stockChoices}
                defaultValue="IN_STOCK"
              />
            </div>

            {/* Dynamic Category Template Section */}
            <CategoryTemplateSection categories={categories} />

            <TextInput
              source="description"
              label="Product Description"
              multiline
              rows={3}
              placeholder="Describe product highlights, key features, care instructions..."
            />

            <ImageUploadInput
              source="images"
              label="Product Images (1 to 5 Photos)"
              helperText="Upload clear photos of your product from multiple angles (max 5 images)"
              multiple
              maxFiles={5}
              folder="products"
            />
          </SimpleForm>
        </CardContent>
      </Card>
    </Create>
  );
};
