import { CuratedListEditor } from "@/features/curated/components/curated-list-editor";

export function TopCpusPage() {
  return (
    <CuratedListEditor
      kind="cpu"
      emptyTitle="هنوز CPU برتری انتخاب نشده"
      emptyDescription="با جستجو، CPUهای منتخب را به این لیست اضافه کنید."
    />
  );
}
