"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/modal";
import ModalTrigger from "@/components/modal-trigger";
import Icon from "@/components/icon";
import { useMessageStore } from "@/stores/messageStore";
import { deleteCategoryAction } from "../actions";
import CategoryForm from "./category-form";
import { CategoryFragment } from "@/lib/graphql/generated/graphql";

const CREATE_DIALOG_ID = "create-category";
const EDIT_DIALOG_ID = "edit-category";

export default function CategoriesManager({
  initialCategories,
}: {
  initialCategories: CategoryFragment[];
}) {
  const [editingCategory, setEditingCategory] = useState<
    CategoryFragment | undefined
  >(undefined);
  const setMessage = useMessageStore((s) => s.setMessage);

  async function handleDelete(category: CategoryFragment) {
    if (!confirm(`Naozaj chcete zmazať kategóriu: ${category.name}?`)) return;
    const res = await deleteCategoryAction({ id: category.id });
    setMessage(res.message, res.success);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ModalTrigger dialogId={CREATE_DIALOG_ID} size="sm">
          <Icon name="plus" className="size-5" /> Nová kategória
        </ModalTrigger>
      </div>

      {initialCategories.length === 0 ? (
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          Žiadne kategórie. Vytvorte prvú kategóriu.
        </p>
      ) : (
        <div className="rounded-lg border dark:border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted dark:bg-card">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-foreground dark:text-muted-foreground">
                  Názov
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground dark:text-muted-foreground">
                  Slug
                </th>
                <th className="px-4 py-3 text-right font-medium text-foreground dark:text-muted-foreground">
                  Akcie
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-border">
              {initialCategories.map((cat) => (
                <tr key={String(cat.id)} className="dark:bg-card">
                  <td className="px-4 py-3 text-foreground dark:text-foreground">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground dark:text-muted-foreground font-mono text-xs">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <ModalTrigger
                        dialogId={EDIT_DIALOG_ID}
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingCategory(cat)}
                      >
                        <Icon name="pencil" className="size-4" />
                      </ModalTrigger>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(cat)}
                      >
                        <Icon name="trash" className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal dialogId={CREATE_DIALOG_ID} title="Nová kategória">
        <CategoryForm dialogId={CREATE_DIALOG_ID} />
      </Modal>

      <Modal dialogId={EDIT_DIALOG_ID} title="Upraviť kategóriu">
        <CategoryForm dialogId={EDIT_DIALOG_ID} category={editingCategory} />
      </Modal>
    </div>
  );
}
