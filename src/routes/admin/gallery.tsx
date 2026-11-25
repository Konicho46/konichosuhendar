import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, inputClass } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { GALLERY_CATEGORIES, isGalleryCategory, type GalleryCategory } from "@/lib/gallery-categories";
import { galleryPhotosQuery, uploadGalleryImage, type GalleryPhoto } from "@/lib/portfolio";
import { moveItem, normalizedOrder } from "@/lib/reorder";

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({
    meta: [
      { title: "Photography Gallery — Portfolio CMS" },
      { name: "description", content: "Manage photography gallery images." },
      { property: "og:title", content: "Photography Gallery — Portfolio CMS" },
      { property: "og:description", content: "Manage photography gallery images." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GalleryAdmin,
});

function GalleryAdmin() {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const { data: photos = [], isLoading } = useQuery(galleryPhotosQuery);
  const list = [...photos].sort((left, right) => left.sort_order - right.sort_order);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GalleryCategory>("Nature");
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["gallery-photos"] });

  const addPhoto = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a photo before uploading.");
      const uploaded = await uploadGalleryImage(file);
      const { error } = await supabase.from("gallery_photos").insert({
        image_url: uploaded.url,
        storage_path: uploaded.storagePath,
        title: title.trim(),
        category,
        sort_order: list.length,
      });
      if (error) {
        await supabase.storage.from("portfolio").remove([uploaded.storagePath]);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      void invalidate();
      setFile(null);
      setTitle("");
      if (fileInput.current) fileInput.current.value = "";
      toast.success("Photo added to the gallery");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const savePhoto = useMutation({
    mutationFn: async (photo: Pick<GalleryPhoto, "id" | "title" | "category">) => {
      const { error } = await supabase.from("gallery_photos").update({ title: photo.title.trim(), category: photo.category }).eq("id", photo.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { void invalidate(); toast.success("Photo details saved"); },
    onError: (error: Error) => toast.error(error.message),
  });

  const removePhoto = useMutation({
    mutationFn: async (photo: GalleryPhoto) => {
      const { error } = await supabase.from("gallery_photos").delete().eq("id", photo.id);
      if (error) throw new Error(error.message);
      const { error: storageError } = await supabase.storage.from("portfolio").remove([photo.storage_path]);
      if (storageError) throw new Error(`The gallery entry was removed, but its image file could not be deleted: ${storageError.message}`);
    },
    onSuccess: () => { void invalidate(); toast.success("Photo removed"); },
    onError: (error: Error) => { void invalidate(); toast.error(error.message); },
  });

  const reorder = useMutation({
    mutationFn: async ({ index, direction }: { index: number; direction: -1 | 1 }) => {
      const ordered = normalizedOrder(moveItem(list, index, direction));
      const results = await Promise.all(ordered.map(({ id, sort_order }) => supabase.from("gallery_photos").update({ sort_order }).eq("id", id)));
      const failed = results.find((result) => result.error);
      if (failed?.error) throw new Error(failed.error.message);
    },
    onSuccess: () => void invalidate(),
    onError: (error: Error) => toast.error(error.message),
  });

  function chooseFile(nextFile: File | undefined) {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    setFile(nextFile);
  }

  return (
    <AdminShell title="Photography Gallery" description="Upload optimized photos and organize them by category.">
      <form
        className="space-y-5 border-y border-border py-6"
        onSubmit={(event) => { event.preventDefault(); addPhoto.mutate(); }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="display text-xl">Add a photograph</h2>
            <p className="mt-1 text-sm text-muted-foreground">Images are compressed before they are stored.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
            <ImagePlus className="h-4 w-4" /> Choose image
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => chooseFile(event.currentTarget.files?.[0])}
          />
        </div>

        {file && (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,0.4fr)]">
            <label className="min-w-0">
              <span className="eyebrow">Selected image</span>
              <p className="mt-2 truncate text-sm text-muted-foreground">{file.name}</p>
            </label>
            <label>
              <span className="eyebrow">Category</span>
              <Select value={category} onValueChange={(value) => { if (isGalleryCategory(value)) setCategory(value); }}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>{GALLERY_CATEGORIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="sm:col-span-2">
              <span className="eyebrow">Short title <span className="normal-case text-muted-foreground">(optional)</span></span>
              <Input className={`${inputClass} mt-2`} value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="A short caption for the image" />
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!file || addPhoto.isPending}>
            <Upload className="h-4 w-4" /> {addPhoto.isPending ? "Compressing and uploading…" : "Add photo"}
          </Button>
          {file && <Button type="button" variant="ghost" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ""; }}>Cancel</Button>}
        </div>
      </form>

      <section className="mt-9">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="display text-xl">Saved photographs</h2>
          <span className="mono-label text-muted-foreground">{list.length} {list.length === 1 ? "photo" : "photos"}</span>
        </div>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading photos…</p> : list.length === 0 ? (
          <div className="border border-dashed border-border px-6 py-12 text-center">
            <p className="display text-lg">Your gallery is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">Add a photo above to start your collection.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {list.map((photo, index) => (
              <GalleryPhotoRow
                key={photo.id}
                photo={photo}
                first={index === 0}
                last={index === list.length - 1}
                onMove={(direction) => reorder.mutate({ index, direction })}
                onSave={(next) => savePhoto.mutate(next)}
                onDelete={() => {
                  if (confirm(`Delete “${photo.title || photo.category}” from the gallery?`)) removePhoto.mutate(photo);
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}

function GalleryPhotoRow({
  photo,
  first,
  last,
  onMove,
  onSave,
  onDelete,
}: {
  photo: GalleryPhoto;
  first: boolean;
  last: boolean;
  onMove: (direction: -1 | 1) => void;
  onSave: (photo: Pick<GalleryPhoto, "id" | "title" | "category">) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(photo.title);
  const [category, setCategory] = useState<GalleryCategory>(isGalleryCategory(photo.category) ? photo.category : "Nature");

  return (
    <li className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
      <img src={photo.image_url} alt={photo.title || `${photo.category} photograph`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,0.45fr)]">
        <label className="min-w-0"><span className="eyebrow">Title</span><Input className={`${inputClass} mt-1`} value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} /></label>
        <label><span className="eyebrow">Category</span><Select value={category} onValueChange={(value) => { if (isGalleryCategory(value)) setCategory(value); }}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{GALLERY_CATEGORIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <Button type="button" size="sm" onClick={() => onSave({ id: photo.id, title, category })}>Save</Button>
          <div className="flex items-center">
            <Button type="button" size="icon" variant="ghost" aria-label="Move photo up" disabled={first} onClick={() => onMove(-1)}><ArrowUp /></Button>
            <Button type="button" size="icon" variant="ghost" aria-label="Move photo down" disabled={last} onClick={() => onMove(1)}><ArrowDown /></Button>
          </div>
          <Button type="button" size="icon" variant="ghost" aria-label="Delete photo" className="text-destructive hover:text-destructive" onClick={onDelete}><Trash2 /></Button>
        </div>
      </div>
    </li>
  );
}