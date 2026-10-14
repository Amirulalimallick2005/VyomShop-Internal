"use client";

import React from "react";
import { Create } from "@/components/admin/create";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { SelectInput } from "@/components/admin/select-input";
import { required } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  { id: "CLOTHING", name: "Clothing" },
  { id: "FOOTWEAR", name: "Footwear" },
  { id: "ACCESSORIES", name: "Accessories" },
  { id: "ELECTRONICS", name: "Electronics" },
  { id: "BEAUTY", name: "Beauty & Personal Care" },
  { id: "HOME", name: "Home & Kitchen" },
  { id: "JEWELLERY", name: "Jewellery" },
  { id: "OTHER", name: "Other" },
];

const stockChoices = [
  { id: "IN_STOCK", name: "In Stock" },
  { id: "LIMITED", name: "Limited Stock" },
  { id: "OUT_OF_STOCK", name: "Out of Stock" },
];

const genderChoices = [
  { id: "MEN", name: "Men" },
  { id: "WOMEN", name: "Women" },
  { id: "UNISEX", name: "Unisex" },
  { id: "KIDS", name: "Kids" },
];

export const SellerProductCreate = () => {
  return (
    <Create redirect="list">
      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <SimpleForm className="max-w-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput source="name" label="Product Name" validate={[required()]} />
              <TextInput source="brand" label="Brand Name" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput source="price" label="Selling Price (₹)" validate={[required()]} />
              <NumberInput source="mrp" label="MRP / List Price (₹)" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectInput
                source="category"
                label="Category"
                choices={categories}
                validate={[required()]}
              />
              <TextInput source="subcategory" label="Subcategory (optional)" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectInput
                source="stockStatus"
                label="Stock Status"
                choices={stockChoices}
                defaultValue="IN_STOCK"
              />
              <SelectInput
                source="gender"
                label="Target Audience"
                choices={genderChoices}
                defaultValue="UNISEX"
              />
            </div>

            <TextInput
              source="description"
              label="Product Description"
              multiline
              rows={3}
            />

            <TextInput
              source="images"
              label="Image URLs (comma separated or single URL)"
              helperText="Paste image link(s) for your product. E.g. https://example.com/image.jpg"
            />
          </SimpleForm>
        </CardContent>
      </Card>
    </Create>
  );
};
