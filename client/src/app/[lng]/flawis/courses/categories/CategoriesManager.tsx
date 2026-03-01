"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import ModalTrigger from "@/components/ModalTrigger";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMessageStore } from "@/stores/messageStore";
import { deleteCategoryAction } from "../actions";
import CategoryForm from "./CategoryForm";
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
        <ModalTrigger dialogId={CREATE_DIALOG_ID}>
          <Button size="sm">
            <PlusIcon className="size-5" /> Nová kategória
          </Button>
        </ModalTrigger>
      </div>

      {initialCategories.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Žiadne kategórie. Vytvorte prvú kategóriu.
        </p>
      ) : (
        <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                  Názov
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                  Slug
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                  Akcie
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {initialCategories.map((cat) => (
                <tr key={String(cat.id)} className="dark:bg-gray-900">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <ModalTrigger dialogId={EDIT_DIALOG_ID}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingCategory(cat)}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                      </ModalTrigger>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(cat)}
                      >
                        <TrashIcon className="size-4" />
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
