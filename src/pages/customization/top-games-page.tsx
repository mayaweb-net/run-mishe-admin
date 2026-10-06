import { CuratedListEditor } from "@/features/curated/components/curated-list-editor";

export function TopGamesPage() {
  return (
    <CuratedListEditor
      kind="game"
      emptyTitle="هنوز بازی برتری انتخاب نشده"
      emptyDescription="با جستجو، بازی‌های منتخب را به این لیست اضافه کنید."
    />
  );
}
