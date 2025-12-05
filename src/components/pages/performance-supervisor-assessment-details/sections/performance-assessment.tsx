"use client";

import * as React from "react";
import { ChevronDown, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ISummaryRow, SupervisorAssessmentResultProps } from "../types";
import { AssessmentSummaryTable } from "./summary-table";
import { Separator } from "@/components/ui/separator";
import { useSupervisorAssessmentDetails } from "../hook";
import { IFormGroup } from "@/services/form/types";

export const mockTableData: ISummaryRow[] = [
  {
    id: "hasil",
    category: "Hasil (70%)",
    score: 3.36,
    maxScore: 5.0,
  },
  {
    id: "proses",
    category: "Proses (30%)",
    score: 1.38,
    maxScore: 5.0,
  },
];

const CategoryDetails: React.FC<{ group: IFormGroup }> = ({ group }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild className="border-b border-primary-border">
        <button className="flex items-center justify-between w-full py-3 text-left hover:opacity-70 transition-opacity">
          <span className="text-base font-semibold text-primary">
            {group.name}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        {group.fields.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-4 flex flex-row justify-between"
          >
            <div className="mb-2">
              <h4 className="font-semibold text-gray-900 text-sm">
                {item.label} ({item.metadata?.score_weight || 0}%)
              </h4>
              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
            </div>
            <div className="flex items-center justify-end gap-6 pt-3">
              <div className="text-right">
                <p className="text-xs text-gray-500">Score</p>
                <p className="text-sm font-semibold text-primary">
                  {item.metadata?.score?.toFixed(2) || 0}
                  <span className="text-text-disabled">
                    /{item.metadata?.maxScore || 0}
                  </span>
                </p>
              </div>
              <Separator orientation="vertical" className="h-full" />
              <div className="text-right">
                <p className="text-xs text-gray-500">Sub Total</p>
                <p className="text-sm font-semibold text-primary">
                  {item.metadata?.subTotal?.toFixed(2) || 0}
                  <span className="text-text-disabled">
                    /{item.metadata?.maxScore || 0}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

// const NotesSection: React.FC<{ notes: Notes }> = ({ notes }) => {
//   const [isOpen, setIsOpen] = React.useState(true);

//   return (
//     <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
//       <CollapsibleTrigger asChild className="border-b border-primary-border">
//         <button className="flex items-center justify-between w-full py-3 text-left hover:opacity-70 transition-opacity">
//           <span className="text-base font-semibold text-primary">Notes</span>
//           <ChevronDown
//             className={`w-5 h-5 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
//           />
//         </button>
//       </CollapsibleTrigger>
//       <CollapsibleContent className="space-y-4">
//         {notes.strengths && (
//           <div className="border rounded-lg p-4">
//             <h4 className="font-semibold text-gray-900 mb-2">Strengths</h4>
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//               <p className="text-sm text-gray-600 whitespace-pre-wrap">
//                 {notes.strengths}
//               </p>
//             </div>
//           </div>
//         )}
//         {notes.weakness && (
//           <div className="border rounded-lg p-4">
//             <h4 className="font-semibold text-gray-900 mb-2">Weakness</h4>
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//               <p className="text-sm text-gray-600 whitespace-pre-wrap">
//                 {notes.weakness}
//               </p>
//             </div>
//           </div>
//         )}
//         {notes.supervisorNotes && (
//           <div className="border rounded-lg p-4">
//             <h4 className="font-semibold text-gray-900 mb-2">
//               Supervisor Notes
//             </h4>
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//               <p className="text-sm text-gray-600 whitespace-pre-wrap">
//                 {notes.supervisorNotes}
//               </p>
//             </div>
//           </div>
//         )}
//       </CollapsibleContent>
//     </Collapsible>
//   );
// };

export const SupervisorAssessmentResult: React.FC<
  SupervisorAssessmentResultProps
> = ({ id }) => {
  const { employeeDetails, groups } = useSupervisorAssessmentDetails(id);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6">
      <div className="space-y-2">
        <h1 className="font-semibold text-black text-xl">
          Supervisor Assessment Result
        </h1>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Assessment Form</p>
            <p className="text-base font-normal text-text-primary">
              {employeeDetails?.data.form.name}
            </p>
          </div>
        </div>
      </div>
      {employeeDetails?.data.status_label === "Not Promoted" && (
        <div className="border border-primary-border rounded-xl p-4 bg-primary-background">
          <div>
            <span className="text-primary font-semibold text-lg">
              Assessment Result :{" "}
            </span>
            <span className="text-error font-semibold text-lg">Failed</span>
          </div>
          <p className="text-base text-text-secondary">
            The employee has been decided not to be promoted. They will remain
            in their current position, and no updates will be made to their
            employment information.
          </p>
        </div>
      )}
      {groups ? (
        <AssessmentSummaryTable data={groups} />
      ) : (
        <p className="text-center font-semibold text-primary">
          No supervisor assessment result data available
        </p>
      )}
      <div className="flex gap-2 items-center">
        <h3 className="font-semibold text-lg text-black">
          Supervisor Assessment Details
        </h3>
      </div>

      {groups && groups.length > 0 ? (
        groups.map((group) => <CategoryDetails key={group.id} group={group} />)
      ) : (
        <p className="text-center font-semibold text-primary">
          No supervisor assessment details data available
        </p>
      )}
    </div>
  );
};

export default SupervisorAssessmentResult;
