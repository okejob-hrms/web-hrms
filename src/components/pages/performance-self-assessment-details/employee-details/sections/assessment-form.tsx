import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type SectionKey = "technical" | "workBehavior";

type Rating = 1 | 2 | 3 | 4 | 5;

interface OpenSections {
  [key: string]: boolean;
}

interface Ratings {
  [itemId: string]: Rating;
}

interface AssessmentItemProps {
  id: string;
  title: string;
  description: string;
  defaultRating?: Rating;
  currentRating?: Rating;
  onRatingChange: (itemId: string, rating: Rating) => void;
}

interface RatingButtonsProps {
  itemId: string;
  currentRating?: Rating;
  onRatingChange: (itemId: string, rating: Rating) => void;
}

interface SectionData {
  key: SectionKey;
  title: string;
  items: AssessmentItemData[];
}

interface AssessmentItemData {
  id: string;
  title: string;
  description: string;
  defaultRating?: Rating;
}

const RatingButtons: React.FC<RatingButtonsProps> = ({
  itemId,
  currentRating,
  onRatingChange,
}) => {
  const ratings: Rating[] = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-2">
      {ratings.map((rating) => (
        <button
          key={rating}
          onClick={() => onRatingChange(itemId, rating)}
          className={`flex-1 py-2 px-4 rounded-md border transition-colors ${
            currentRating === rating
              ? "bg-[#0e6488] text-white border-[#0e6488]"
              : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
          }`}
          type="button"
        >
          {rating}
        </button>
      ))}
    </div>
  );
};

const AssessmentItem: React.FC<AssessmentItemProps> = ({
  id,
  title,
  description,
  defaultRating,
  currentRating,
  onRatingChange,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-4 h-4 text-[#0e6488]" />
        <button
          className="text-sm text-[#0e6488] font-medium hover:underline"
          type="button"
        >
          Deskripsi Penilaian
        </button>
      </div>
      <RatingButtons
        itemId={id}
        currentRating={currentRating || defaultRating}
        onRatingChange={onRatingChange}
      />
    </div>
  );
};

export const AssessmentForm: React.FC = () => {
  const [openSections, setOpenSections] = useState<OpenSections>({
    technical: true,
    workBehavior: true,
  });

  const [ratings, setRatings] = useState<Ratings>({});

  const toggleSection = (section: SectionKey): void => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleRating = (itemId: string, rating: Rating): void => {
    setRatings((prev) => ({ ...prev, [itemId]: rating }));
  };

  const handleSubmit = (): void => {
    console.log("Submitted ratings:", ratings);
  };

  const sections: SectionData[] = [
    {
      key: "technical",
      title: "Penilaian Kompetensi Teknis",
      items: [
        {
          id: "tech1",
          title: "Menjalankan mesin pemotong kain",
          description: "Mampu mengoperasikan dan mengatur mesin pemotong",
          defaultRating: 4,
        },
        {
          id: "tech2",
          title: "Memahami SOP produksi",
          description: "Mengetahui dan mematuhi SOP dalam proses pembuatan tas",
          defaultRating: 5,
        },
        {
          id: "tech3",
          title: "Quality Control dasar",
          description: "Bisa mendeteksi cacat kain atau jahitan dasar",
          defaultRating: 3,
        },
        {
          id: "tech4",
          title: "Perawatan alat kerja",
          description: "Membersihkan dan merawat alat produksi secara berkala",
          defaultRating: 4,
        },
      ],
    },
    {
      key: "workBehavior",
      title: "Sikap Kerja dan Perilaku Kerja",
      items: [
        {
          id: "behav1",
          title: "Disiplin waktu",
          description: "Datang tepat waktu dan mematuhi jam kerja",
          defaultRating: 5,
        },
        {
          id: "behav2",
          title: "Kerja sama tim",
          description: "Kooperatif dan membantu rekan kerja",
          defaultRating: 4,
        },
        {
          id: "behav3",
          title: "Tanggung jawab pekerjaan",
          description: "Menyelesaikan tugas tanpa pengawasan berlebihan",
          defaultRating: 4,
        },
        {
          id: "behav4",
          title: "Kepedulian terhadap kebersihan area",
          description: "Menjaga area kerja tetap bersih dan rapi",
          defaultRating: 3,
        },
      ],
    },
  ];

  return (
    <div className="w-full mx-auto">
      {sections.map((section) => (
        <Collapsible
          key={section.key}
          open={openSections[section.key]}
          onOpenChange={() => toggleSection(section.key)}
          className="mb-6"
        >
          <div className="bg-white border border-gray-200 rounded-lg">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
              <h2 className="text-lg font-semibold text-[#0e6488]">
                {section.title}
              </h2>
              {openSections[section.key] ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="p-6 space-y-4">
                {section.items.map((item) => (
                  <AssessmentItem
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    defaultRating={item.defaultRating}
                    currentRating={ratings[item.id]}
                    onRatingChange={handleRating}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
};
