
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Percent, Users, Calculator } from "lucide-react";

const formSchema = z.object({
  billAmount: z.coerce
    .number({ invalid_type_error: "Please enter a valid number." })
    .min(0, "Bill amount must be $0 or more.")
    .optional(), // Allow undefined to clear, but handle in component
  tipPercentageOption: z.string(),
  customTipPercentage: z.coerce
    .number({ invalid_type_error: "Please enter a valid number." })
    .min(0, "Custom tip must be 0% or more.")
    .optional(),
  numberOfPeople: z.coerce
    .number({ invalid_type_error: "Please enter a valid number." })
    .int("Number of people must be a whole number.")
    .min(1, "Must be at least 1 person."),
});

type FormValues = z.infer<typeof formSchema>;

const tipOptions = [
  { value: "15", label: "15%" },
  { value: "18", label: "18%" },
  { value: "20", label: "20%" },
  { value: "25", label: "25%" },
  { value: "custom", label: "Custom" },
];

export default function TipCalculator() {
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [amountPerPerson, setAmountPerPerson] = useState<number>(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billAmount: undefined,
      tipPercentageOption: "18",
      customTipPercentage: undefined,
      numberOfPeople: 1,
    },
  });

  const watchedBillAmount = form.watch("billAmount");
  const watchedTipOption = form.watch("tipPercentageOption");
  const watchedCustomTip = form.watch("customTipPercentage");
  const watchedNumPeople = form.watch("numberOfPeople");

  useEffect(() => {
    const bill = parseFloat(String(watchedBillAmount)) || 0;
    const people = parseInt(String(watchedNumPeople), 10) || 1;
    let tipPercent = 0;

    if (watchedTipOption === "custom") {
      tipPercent = parseFloat(String(watchedCustomTip)) || 0;
    } else {
      tipPercent = parseFloat(watchedTipOption) || 0;
    }
    
    if (bill < 0 || people < 1 || tipPercent < 0) {
        setTipAmount(0);
        setTotalAmount(bill > 0 ? bill : 0);
        setAmountPerPerson(bill > 0 && people >=1 ? bill / people : 0);
        return;
    }

    const calculatedTip = bill * (tipPercent / 100);
    const calculatedTotal = bill + calculatedTip;
    const calculatedPerPerson = calculatedTotal / people;

    setTipAmount(calculatedTip);
    setTotalAmount(calculatedTotal);
    setAmountPerPerson(calculatedPerPerson);
  }, [watchedBillAmount, watchedTipOption, watchedCustomTip, watchedNumPeople, form.formState.isValid]);

  const formatCurrency = (value: number) => {
    return isNaN(value) || !isFinite(value) ? "$0.00" : value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper to ensure value is a string for controlled inputs
  const getControlledValue = (value: number | undefined | string) => {
    if (value === undefined || value === null) return "";
    return String(value);
  };


  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Calculator className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">TipSplitter</CardTitle>
        <CardDescription className="text-muted-foreground">
          Quickly calculate tips and split bills with friends.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div>
            <Label htmlFor="billAmount" className="flex items-center text-sm font-medium mb-1">
              <DollarSign className="mr-2 h-5 w-5 text-primary" />
              Bill Amount
            </Label>
            <Controller
              name="billAmount"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="billAmount"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  {...field}
                  value={getControlledValue(field.value)}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? undefined : parseFloat(value));
                  }}
                  className="text-base"
                  aria-invalid={form.formState.errors.billAmount ? "true" : "false"}
                />
              )}
            />
            {form.formState.errors.billAmount && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.billAmount.message}
              </p>
            )}
          </div>

          <div>
            <Label className="flex items-center text-sm font-medium mb-1">
              <Percent className="mr-2 h-5 w-5 text-primary" />
              Select Tip %
            </Label>
            <Controller
              name="tipPercentageOption"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-3 gap-2 sm:grid-cols-5"
                >
                  {tipOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <RadioGroupItem
                        value={option.value}
                        id={`tip-${option.value}`}
                        className="peer sr-only"
                        aria-label={`${option.label} tip`}
                      />
                      <Label
                        htmlFor={`tip-${option.value}`}
                        className="flex w-full cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          {watchedTipOption === "custom" && (
            <div>
              <Label htmlFor="customTipPercentage" className="text-sm font-medium">Custom Tip %</Label>
              <Controller
                name="customTipPercentage"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="customTipPercentage"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    {...field}
                    value={getControlledValue(field.value)}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : parseFloat(value));
                    }}
                    className="mt-1 text-base"
                    aria-invalid={form.formState.errors.customTipPercentage ? "true" : "false"}
                  />
                )}
              />
              {form.formState.errors.customTipPercentage && (
                <p className="mt-1 text-sm text-destructive">
                  {form.formState.errors.customTipPercentage.message}
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="numberOfPeople" className="flex items-center text-sm font-medium mb-1">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Number of People
            </Label>
            <Controller
              name="numberOfPeople"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="numberOfPeople"
                  type="number"
                  placeholder="1"
                  min="1"
                  step="1"
                  {...field}
                  value={getControlledValue(field.value)}
                   onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? undefined : parseInt(value, 10));
                  }}
                  className="text-base"
                  aria-invalid={form.formState.errors.numberOfPeople ? "true" : "false"}
                />
              )}
            />
            {form.formState.errors.numberOfPeople && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.numberOfPeople.message}
              </p>
            )}
          </div>
        </form>
      </CardContent>
      <Separator className="my-4" />
      <CardFooter className="flex flex-col space-y-4 pt-6">
        <div className="w-full space-y-3 rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Tip Amount</p>
            <p className="text-xl font-semibold text-primary">{formatCurrency(tipAmount)}</p>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Total Bill (incl. Tip)</p>
            <p className="text-xl font-semibold text-primary">{formatCurrency(totalAmount)}</p>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Amount Per Person</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(amountPerPerson)}</p>
          </div>
        </div>
         <Button
            type="button"
            onClick={() => {
              form.reset({
                billAmount: undefined,
                tipPercentageOption: "18",
                customTipPercentage: undefined,
                numberOfPeople: 1,
              });
              // Resetting calculated values is handled by useEffect due to form.reset
            }}
            variant="outline"
            className="w-full mt-4"
          >
            Reset
          </Button>
      </CardFooter>
    </Card>
  );
}
