"use client";

import React from "react";
import { Create } from "@/components/admin/create";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { required } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

export const PackageCreate = () => {
  return (
    <Create redirect="list">
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <SimpleForm className="max-w-none">
            <TextInput source="name" label="Package Name" validate={[required()]} />
            <TextInput source="badge" label="Badge Text (e.g. POPULAR, BEST VALUE)" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NumberInput source="totalListings" label="Total Listings" validate={[required()]} />
              <NumberInput source="freeCredits" label="Free Credits" defaultValue={0} />
              <NumberInput source="paidCredits" label="Paid Credits" defaultValue={0} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput source="price" label="Price (₹)" validate={[required()]} />
              <NumberInput source="perProductPrice" label="Per Product Price (₹)" />
            </div>
            <TextInput source="description" label="Description" multiline rows={3} />
            <BooleanInput source="isActive" label="Active and available for purchase" defaultValue={true} />
          </SimpleForm>
        </CardContent>
      </Card>
    </Create>
  );
};
