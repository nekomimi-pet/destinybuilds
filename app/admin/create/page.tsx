"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { ArrowLeft, PlusCircle, X, Link2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { destinyApi } from "@/lib/destinyApi"
import pb from "@/lib/pocketbase";
import { Checkbox } from "@/components/ui/checkbox"

// Define Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  slug: z.string().min(2, { message: "Slug must be at least 2 characters." })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens." }),
  class: z.enum(["Hunter", "Warlock", "Titan"], { 
    required_error: "Class is required." 
  }),
  subclass: z.enum(["Solar", "Arc", "Void", "Strand", "Stasis", "Prismatic"], { 
    required_error: "Subclass is required." 
  }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  mode: z.enum(["PvE", "PvP"], { 
    required_error: "Mode is required." 
  }),
  tags: z.string().optional(),
  exotics: z.string().min(1, { message: "At least one exotic is required." }),
  key_mods: z.string().optional(),
  target_stats: z.string().optional(),
  aspects: z.string().min(1, { message: "At least one aspect is required." }),
  fragments: z.string().min(1, { message: "At least one fragment is required." }),
  how_it_works: z.string().min(10, { message: "How It Works is required." }), 
  how_it_works2: z.string().optional(),
  // Metrics
  metrics_versatility: z.coerce.number().min(0).max(10).optional(),
  metrics_easeOfUse: z.coerce.number().min(0).max(10).optional(),
  metrics_survivability: z.coerce.number().min(0).max(10).optional(),
  metrics_dps: z.coerce.number().min(0).max(10).optional(),
  metrics_crowdControl: z.coerce.number().min(0).max(10).optional(),
  metrics_buffHealingSupport: z.coerce.number().min(0).max(10).optional(),
  metrics_contentBestFor: z.string().optional(),
  metrics_teamplayOrientation: z.coerce.number().min(0).max(10).optional(),
  parent_build_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateBuildPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aspects, setAspects] = useState<{ name: string; description: string; }[]>([]);
  const [fragments, setFragments] = useState<{ name: string; description: string; }[]>([]);
  const [autoUpdateSlug, setAutoUpdateSlug] = useState(true);
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      class: undefined,
      subclass: undefined,
      description: "",
      imageUrl: "",
      mode: "PvE",
      tags: "",
      exotics: "",
      key_mods: "",
      target_stats: "",
      aspects: "",
      fragments: "",
      how_it_works: "",
      how_it_works2: "",
      metrics_versatility: 5,
      metrics_easeOfUse: 5,
      metrics_survivability: 5,
      metrics_dps: 5,
      metrics_crowdControl: 5,
      metrics_buffHealingSupport: 5,
      metrics_contentBestFor: "",
      metrics_teamplayOrientation: 5,
      parent_build_id: "",
    },
  });
  
  // Load aspects and fragments when subclass changes
  const onSubclassChange = async (subclass: string) => {
    if (subclass === "Prismatic") {
      // For Prismatic subclass, we don't fetch aspects/fragments
      setAspects([]);
      setFragments([]);
      return;
    }
    
    try {
      const aspectsData = await destinyApi.getAspectsBySubclass(subclass as any);
      const fragmentsData = await destinyApi.getFragmentsBySubclass(subclass as any);
      
      setAspects(aspectsData.map(aspect => ({
        name: aspect.displayProperties.name,
        description: aspect.displayProperties.description
      })));
      
      setFragments(fragmentsData.map(fragment => ({
        name: fragment.displayProperties.name,
        description: fragment.displayProperties.description
      })));
    } catch (error) {
      console.error("Error fetching aspects/fragments:", error);
      toast.error("Failed to load aspects and fragments");
    }
  };
  
  // Function to convert name to slug format
  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Helper to parse comma/newline separated strings into JSON arrays
      const parseToArray = (str: string | undefined, separator: string | RegExp = ',') => {
        return JSON.stringify(str ? str.split(separator).map(s => s.trim()).filter(Boolean) : []);
      };
      
      // Prepare data for PocketBase - convert string fields to JSON arrays
      const pocketbaseData = {
        id: data.slug,
        name: data.name,
        class: data.class,
        subclass: data.subclass,
        description: data.description,
        imageUrl: data.imageUrl || null,
        mode: data.mode,
        tags: parseToArray(data.tags),
        exotics: parseToArray(data.exotics),
        key_mods: parseToArray(data.key_mods),
        target_stats: parseToArray(data.target_stats),
        aspects: parseToArray(data.aspects),
        fragments: parseToArray(data.fragments),
        how_it_works: parseToArray(data.how_it_works, /\r?\n/), // Split by newline
        how_it_works2: data.how_it_works2 ? parseToArray(data.how_it_works2, /\r?\n/) : null,
        metrics: JSON.stringify({
          versatility: data.metrics_versatility,
          easeOfUse: data.metrics_easeOfUse,
          survivability: data.metrics_survivability,
          dps: data.metrics_dps,
          crowdControl: data.metrics_crowdControl,
          buffHealingSupport: data.metrics_buffHealingSupport,
          contentBestFor: data.metrics_contentBestFor?.split(',').map(s => s.trim()).filter(Boolean) ?? [],
          teamplayOrientation: data.metrics_teamplayOrientation,
        }),
        parent_build_id: data.parent_build_id || null,
      };
      
      // Submit to PocketBase
      const record = await pb.collection('builds').create(pocketbaseData);
      
      toast.success("Build created successfully!");
      router.push(`/builds/${record.id}`);
      router.refresh(); // Refresh to update the builds list
    } catch (error: any) {
      console.error("Error creating build:", error);
      const errorMessage = error.response?.data 
        ? JSON.stringify(error.response.data) 
        : error.message || "Unknown error";
      toast.error(`Failed to create build: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Tag input component with nice UI
  const TagInput = ({ 
    value, 
    onChange, 
    placeholder, 
    label
  }: { 
    value: string, 
    onChange: (value: string) => void, 
    placeholder: string,
    label: string
  }) => {
    const [inputValue, setInputValue] = useState("");
    
    const tags = value.split(',').filter(Boolean).map(tag => tag.trim());
    
    const addTag = () => {
      if (inputValue.trim()) {
        const newTags = [...tags, inputValue.trim()];
        onChange(newTags.join(', '));
        setInputValue("");
      }
    };
    
    const removeTag = (tagToRemove: string) => {
      const newTags = tags.filter(tag => tag !== tagToRemove);
      onChange(newTags.join(', '));
    };
    
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <div key={tag} className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
              {tag}
              <button 
                type="button" 
                onClick={() => removeTag(tag)}
                className="ml-1 text-primary/70 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
              if (e.key === ',' || e.key === ';') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={addTag}
            disabled={!inputValue.trim()}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Press Enter, comma, or click the plus button to add a {label.toLowerCase()}
        </p>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/builds" className="flex items-center text-primary mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all builds
      </Link>
      
      <h1 className="text-4xl font-bold mb-6">Create New Build</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Build Details</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Build Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Celestial Nighthawk DPS" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            
                            // Auto-update slug if enabled
                            if (autoUpdateSlug) {
                              const slug = generateSlugFromName(e.target.value);
                              form.setValue("slug", slug);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Build URL Slug</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="e.g., celestial-nighthawk-dps" 
                            {...field} 
                            onChange={(e) => {
                              // Convert to lowercase and replace spaces with hyphens
                              const value = e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, '-')
                                .replace(/[^a-z0-9-]/g, '');
                              field.onChange(value);
                              
                              // Disable auto-update if user manually edits
                              if (autoUpdateSlug) {
                                setAutoUpdateSlug(false);
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            size="icon" 
                            variant="outline"
                            title={autoUpdateSlug ? "Auto-update from name enabled" : "Auto-update from name disabled"}
                            onClick={() => setAutoUpdateSlug(!autoUpdateSlug)}
                            className={autoUpdateSlug ? "bg-primary/10" : ""}
                          >
                            <Link2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription className="flex items-center gap-2 mt-2">
                        <Checkbox 
                          id="auto-slug" 
                          checked={autoUpdateSlug} 
                          onCheckedChange={(checked) => setAutoUpdateSlug(checked as boolean)} 
                        />
                        <label htmlFor="auto-slug" className="text-xs cursor-pointer">
                          Automatically generate from build name
                        </label>
                      </FormDescription>
                      <FormDescription>
                        This will be used in the URL (builds/your-slug). Only lowercase letters, numbers, and hyphens.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Hunter">Hunter</SelectItem>
                          <SelectItem value="Warlock">Warlock</SelectItem>
                          <SelectItem value="Titan">Titan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="subclass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subclass</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          onSubclassChange(value);
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subclass" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Solar">Solar</SelectItem>
                          <SelectItem value="Arc">Arc</SelectItem>
                          <SelectItem value="Void">Void</SelectItem>
                          <SelectItem value="Strand">Strand</SelectItem>
                          <SelectItem value="Stasis">Stasis</SelectItem>
                          <SelectItem value="Prismatic">Prismatic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Mode</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a game mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PvE">PvE</SelectItem>
                          <SelectItem value="PvP">PvP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a short description of this build and its main strengths." 
                        {...field} 
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL for an image to represent this build. Leave empty to use an exotic item image.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput 
                        value={field.value || ""} 
                        onChange={field.onChange}
                        placeholder="Enter a tag and press Enter..."
                        label="Tag"
                      />
                    </FormControl>
                    <FormDescription>
                      Add relevant tags like "Boss DPS", "Support", etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Exotics */}
              <FormField
                control={form.control}
                name="exotics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exotics</FormLabel>
                    <FormControl>
                      <TagInput 
                        value={field.value || ""} 
                        onChange={field.onChange}
                        placeholder="Enter an exotic name and press Enter..."
                        label="Exotic"
                      />
                    </FormControl>
                    <FormDescription>
                      Add all required exotic armor and weapons.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Key Mods */}
              <FormField
                control={form.control}
                name="key_mods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Mods</FormLabel>
                    <FormControl>
                      <TagInput 
                        value={field.value || ""} 
                        onChange={field.onChange}
                        placeholder="Enter a mod name and press Enter..."
                        label="Mod"
                      />
                    </FormControl>
                    <FormDescription>
                      Add important armor mods for this build.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Target Stats */}
              <FormField
                control={form.control}
                name="target_stats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Stats</FormLabel>
                    <FormControl>
                      <TagInput 
                        value={field.value || ""} 
                        onChange={field.onChange}
                        placeholder="Enter a stat and press Enter..."
                        label="Stat"
                      />
                    </FormControl>
                    <FormDescription>
                      Add stats to prioritize like "resilience", "discipline", etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Aspects */}
              <FormField
                control={form.control}
                name="aspects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aspects</FormLabel>
                    <FormControl>
                      <TagInput 
                        value={field.value || ""} 
                        onChange={field.onChange}
                        placeholder="Enter an aspect name and press Enter..."
                        label="Aspect"
                      />
                    </FormControl>
                    <FormDescription>
                      Add the required aspects for this build.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Display available aspects if a subclass is selected */}
              {aspects.length > 0 && (
                <div className="bg-muted/30 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Available Aspects</h3>
                  <div className="space-y-2">
                    {aspects.map(aspect => (
                      <Card key={aspect.name} className="overflow-hidden">
                        <CardHeader className="p-3">
                          <CardTitle className="text-base">{aspect.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <CardDescription className="text-xs">{aspect.description}</CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Fragments */}
              <FormField
                control={form.control}
                name="fragments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fragments</FormLabel>
                    <FormControl>
                      <TagInput 
                        value={field.value || ""} 
                        onChange={field.onChange}
                        placeholder="Enter a fragment name and press Enter..."
                        label="Fragment"
                      />
                    </FormControl>
                    <FormDescription>
                      Add the required fragments for this build.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Display available fragments if a subclass is selected */}
              {fragments.length > 0 && (
                <div className="bg-muted/30 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Available Fragments</h3>
                  <div className="space-y-2">
                    {fragments.map(fragment => (
                      <Card key={fragment.name} className="overflow-hidden">
                        <CardHeader className="p-3">
                          <CardTitle className="text-base">{fragment.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <CardDescription className="text-xs">{fragment.description}</CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="instructions" className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="how_it_works"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How This Build Works</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain how this build works. Each paragraph will be separated." 
                        {...field} 
                        className="min-h-[200px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Write several paragraphs explaining the build mechanics. Each paragraph should be on a new line.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="how_it_works2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Build Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide additional details or advanced usage tips." 
                        {...field} 
                        className="min-h-[200px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Add more detailed instructions or variations. Each paragraph should be on a new line.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Versatility */}
                <FormField
                  control={form.control}
                  name="metrics_versatility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versatility (1-10)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{field.value || 5}</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        How well the build performs across different activities.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                {/* Ease of Use */}
                <FormField
                  control={form.control}
                  name="metrics_easeOfUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ease of Use (1-10)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{field.value || 5}</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        How easy it is to understand and execute the build.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                {/* Survivability */}
                <FormField
                  control={form.control}
                  name="metrics_survivability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Survivability (1-10)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{field.value || 5}</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        How well the build helps you survive in difficult content.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                {/* DPS */}
                <FormField
                  control={form.control}
                  name="metrics_dps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DPS (1-10)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{field.value || 5}</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        How much damage the build can output.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                {/* Crowd Control */}
                <FormField
                  control={form.control}
                  name="metrics_crowdControl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crowd Control (1-10)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{field.value || 5}</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        How well the build can control groups of enemies.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                {/* Buff/Healing Support */}
                <FormField
                  control={form.control}
                  name="metrics_buffHealingSupport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buff/Healing Support (1-10)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{field.value || 5}</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        How well the build supports teammates with buffs or healing.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                {/* Teamplay Orientation */}
                <FormField
                  control={form.control}
                  name="metrics_teamplayOrientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teamplay Orientation (1-10)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{field.value || 5}</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        How oriented the build is toward team activities vs. solo play.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Content Best For */}
              <FormField
                control={form.control}
                name="metrics_contentBestFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Best For</FormLabel>
                    <FormControl>
                      <TagInput 
                        value={field.value || ""} 
                        onChange={field.onChange}
                        placeholder="Enter a content type and press Enter..."
                        label="Content Type"
                      />
                    </FormControl>
                    <FormDescription>
                      Add content types this build excels at (e.g., "Raids", "Dungeons", "Nightfalls").
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/builds">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Build"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
} 