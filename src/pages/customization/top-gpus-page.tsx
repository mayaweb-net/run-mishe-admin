import { CuratedListEditor } from "@/features/curated/components/curated-list-editor";

export function TopGpusPage() {
  return (
    <CuratedListEditor
      kind="gpu"
      emptyTitle="هنوز GPU برتری انتخاب نشده"
      emptyDescription="با جستجو، GPUهای منتخب را به این لیست اضافه کنید."
    />
  );
}
