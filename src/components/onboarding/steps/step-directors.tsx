'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StepDirectors() {
  const form = useFormContext<OnboardingFormData>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'directors',
  });

  const addNewDirector = () => {
    append({
      fullName: '',
      idNumber: '',
      dateOfBirth: '',
      address: '',
      designation: '',
      phoneNumber: '',
      gender: ''
    });
  };

  return (
    <div>
      <CardHeader>
        <CardTitle>Directors and Signatories</CardTitle>
        <CardDescription>Please provide the details for all directors and authorized signatories.</CardDescription>
      </CardHeader>
      <div className="space-y-4 px-6">
        <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
          {fields.map((field, index) => (
            <AccordionItem value={`item-${index}`} key={field.id}>
              <AccordionTrigger>
                <div className="flex justify-between w-full items-center pr-4">
                  <span>Director {index + 1}</span>
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent accordion from toggling
                      remove(index);
                    }}
                   >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-1">
                   <FormField
                      control={form.control}
                      name={`directors.${index}.fullName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name={`directors.${index}.idNumber`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>ID Number</FormLabel>
                            <FormControl>
                                <Input placeholder="National ID or Passport No." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name={`directors.${index}.dateOfBirth`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <FormField
                      control={form.control}
                      name={`directors.${index}.address`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, Harare" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                        control={form.control}
                        name={`directors.${index}.designation`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Designation</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. CEO" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={`directors.${index}.phoneNumber`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="+263 77 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                          control={form.control}
                          name={`directors.${index}.gender`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addNewDirector}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Director
        </Button>
      </div>
    </div>
  );
}
