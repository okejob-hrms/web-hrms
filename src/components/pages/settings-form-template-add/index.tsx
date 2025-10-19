import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { TemplateFormSchema, useFormTemplateAdd } from "./hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SelectForm } from "@/components/ui/select-form";
import { FormTemplate } from "./sections/form-template";

interface Question {
  id: string;
  name: string;
  description: string;
  type: string;
}

export const SettingsFormTemplateAdd = React.memo(
  function SettingsFormTemplateAdd() {
    const { formSchema, formOptions, handleSubmit } = useFormTemplateAdd();
    const [questions, setQuestions] = React.useState<Question[]>([]);

    const form = useForm<TemplateFormSchema>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        usage: "",
        // questions: []
      },
    });

    const addQuestion = React.useCallback(() => {
      const newQuestion: Question = {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        type: "",
      };
      setQuestions((prev) => [...prev, newQuestion]);
    }, []);

    const removeQuestion = React.useCallback((id: string) => {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }, []);

    const updateQuestionType = React.useCallback((id: string, type: string) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, type } : q)),
      );
    }, []);

    const onSubmit = React.useCallback(() => {}, []);

    const hasQuestions = questions.length > 0;

    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <h1 className="font-semibold text-lg text-black">Form Details</h1>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <InputForm name="name" label="Form Name" required />
            <SelectForm
              name="usage"
              label="Form Usage"
              required
              options={formOptions}
              className="w-full"
            />
            <hr className="col-span-2" />

            {!hasQuestions ? (
              <div className="col-span-2 p-4 rounded-sm bg-primary-background border border-primary-border flex flex-col items-center justify-center gap-2">
                <p className="text-primary font-bold text-lg">
                  Nothing here yet
                </p>
                <p className="text-text-secondary text-base font-normal">
                  Start building your first form now
                </p>
                <Button type="button" onClick={addQuestion}>
                  <Plus /> Add Question
                </Button>
              </div>
            ) : (
              <div className="col-span-2 flex flex-col gap-2 items-center">
                {questions.map((question, index) => (
                  <FormTemplate
                    key={question.id}
                    index={index}
                    type={question.type}
                    onRemove={() => removeQuestion(question.id)}
                    canRemove={true}
                    onTypeChange={(type) =>
                      updateQuestionType(question.id, type)
                    }
                  />
                ))}
                <Button
                  variant="outline"
                  type="button"
                  className="text-primary"
                  onClick={addQuestion}
                >
                  <Plus /> Add Question
                </Button>
              </div>
            )}

            <div className="col-span-2 flex gap-4">
              <Button type="button" variant="outline" className="md:w-[174px]">
                Cancel
              </Button>
              <Button
                type="submit"
                className="md:w-[174px]"
                disabled={!hasQuestions}
              >
                Save
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    );
  },
);
