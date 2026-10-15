"use client";

import React from "react";
import { Create } from "@/components/admin/create";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { required } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

export const CategoryCreate = () => {
  return (
    <Create redirect="list">
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <SimpleForm className="max-w-none">
            <TextInput
              source="name"
              label="Category Name"
              placeholder="e.g. Footwear, Ethnic Wear, Electronics"
              validate={[required()]}
            />
            <TextInput
              source="slug"
              label="URL Slug (optional - auto-generated if left blank)"
              placeholder="e.g. footwear, ethnic-wear"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput
                source="sortOrder"
                label="Sort Order"
                defaultValue={0}
                helperText="Lower numbers appear first in the seller listing dropdown"
              />
              <TextInput
                source="icon"
                label="Icon / Image URL (optional)"
                placeholder="https://..."
              />
            </div>
            <TextInput
              source="description"
              label="Description (optional)"
              multiline
              rows={3}
              placeholder="Brief description of products belonging to this category"
            />
            <BooleanInput
              source="isActive"
              label="Active (visible to sellers for product listing)"
              defaultValue={true}
            />
          </SimpleForm>
        </CardContent>
      </Card>
    </Create>
  );
};
