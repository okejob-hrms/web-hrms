"use client";

import * as React from "react";
import { ChevronDown, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CategorySection,
  ISummaryRow,
  Notes,
  SupervisorAssessmentResultProps,
} from "../types";
import { AssessmentSummaryTable } from "./summary-table";
import { Separator } from "@/components/ui/separator";

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

const CategoryDetails: React.FC<{ category: CategorySection }> = ({
  category,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild className="border-b border-primary-border">
        <button className="flex items-center justify-between w-full py-3 text-left hover:opacity-70 transition-opacity">
          <span className="text-base font-semibold text-primary">
            {category.name}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        {category.items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-4 flex flex-row justify-between"
          >
            <div className="mb-2">
              <h4 className="font-semibold text-gray-900 text-sm">
                {item.title} ({item.percentage}%)
              </h4>
              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
            </div>
            <div className="flex items-center justify-end gap-6 pt-3">
              <div className="text-right">
                <p className="text-xs text-gray-500">Score</p>
                <p className="text-sm font-semibold text-primary">
                  {item.score.toFixed(2)}
                  <span className="text-text-disabled">/{item.maxScore}</span>
                </p>
              </div>
              <Separator orientation="vertical" className="h-full" />
              <div className="text-right">
                <p className="text-xs text-gray-500">Sub Total</p>
                <p className="text-sm font-semibold text-primary">
                  {item.subTotal.toFixed(2)}
                  <span className="text-text-disabled">/{item.maxScore}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

const NotesSection: React.FC<{ notes: Notes }> = ({ notes }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild className="border-b border-primary-border">
        <button className="flex items-center justify-between w-full py-3 text-left hover:opacity-70 transition-opacity">
          <span className="text-base font-semibold text-primary">Notes</span>
          <ChevronDown
            className={`w-5 h-5 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        {notes.strengths && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Strengths</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {notes.strengths}
              </p>
            </div>
          </div>
        )}
        {notes.weakness && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Weakness</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {notes.weakness}
              </p>
            </div>
          </div>
        )}
        {notes.supervisorNotes && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              Supervisor Notes
            </h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {notes.supervisorNotes}
              </p>
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const SupervisorAssessmentResult: React.FC<
  SupervisorAssessmentResultProps
> = ({ onEdit }) => {
  const categories: CategorySection[] = [
    {
      id: "hasil",
      name: "Hasil",
      items: [
        {
          id: "pengetahuan-kerja",
          title: "Pengetahuan Kerja",
          description:
            "Pemahaman akan fungsi tugas & alur pekerjaan pokok yang dilakukan secara rutin",
          percentage: 20,
          score: 5.0,
          maxScore: 5.0,
          subTotal: 1.0,
        },
        {
          id: "kualitas-pekerjaan",
          title: "Kualitas Pekerjaan",
          description:
            "Hasil akhir yang dicapai sesuai dengan standar yang ditentukan termasuk meminimalkan tingkat kesalahan",
          percentage: 20,
          score: 5.0,
          maxScore: 5.0,
          subTotal: 1.0,
        },
        {
          id: "kecepatan-kerja",
          title: "Kecepatan Kerja",
          description:
            "Mampu menyelesaikan pekerjaan sesuai dengan batas waktu yang telah ditentukan",
          percentage: 20,
          score: 5.0,
          maxScore: 5.0,
          subTotal: 1.0,
        },
        {
          id: "kemauan-berprestasi",
          title: "Kemauan Berprestasi",
          description:
            "Kemauan / minat karyawan untuk berprestasi dalam pekerjaannya, melakukan perbaikan kualitas pekerjaannya",
          percentage: 20,
          score: 5.0,
          maxScore: 5.0,
          subTotal: 1.0,
        },
        {
          id: "inisiatif",
          title: "Inisiatif",
          description:
            "Mampu bekerja mandiri & dapat memberikan ide-ide serta gagasan untuk meningkatkan kualitas pekerjaan",
          percentage: 20,
          score: 4.0,
          maxScore: 5.0,
          subTotal: 0.8,
        },
      ],
    },
    {
      id: "proses",
      name: "Proses",
      items: [
        {
          id: "disiplin",
          title: "Disiplin",
          description:
            "Ketaatan terhadap peraturan dan tata tertib yang berlaku di perusahaan",
          percentage: 30,
          score: 5.0,
          maxScore: 5.0,
          subTotal: 1.5,
        },
        {
          id: "komunikasi",
          title: "Komunikasi",
          description:
            "Kemampuan menyampaikan informasi dengan jelas dan mendengarkan masukan dari rekan kerja",
          percentage: 20,
          score: 4.0,
          maxScore: 5.0,
          subTotal: 0.8,
        },
        {
          id: "kerja-sama",
          title: "Kerja Sama",
          description:
            "Kemampuan bekerja sama dengan tim dan berkontribusi untuk mencapai tujuan bersama",
          percentage: 30,
          score: 5.0,
          maxScore: 5.0,
          subTotal: 1.5,
        },
        {
          id: "etika-kerja",
          title: "Etika Kerja",
          description:
            "Integritas, kejujuran, dan tanggung jawab dalam menjalankan pekerjaan sehari-hari",
          percentage: 20,
          score: 4.0,
          maxScore: 5.0,
          subTotal: 0.8,
        },
      ],
    },
  ];

  const notes: Notes = {
    strengths: `Konsisten mencapai target produksi harian tanpa banyak error.
	Disiplin tinggi, jarang absen dan selalu datang tepat waktu.
	Mampu mengoperasikan lebih dari satu jenis mesin (multi-machine handler).
	Menunjukkan inisiatif membantukan rekan kerja saat terjadi backlog.`,
    weakness: `Masih kurang teliti dalam mencatat laporan hasil kerja harian.
	Kurang aktif menyampaikan ide atau saran dalam briefing pagi.
	Perlu peningkatan pemahaman terhadap SOP baru yang diterbitkan bulan ini.
	Beberapa kali mengalami kesalahan minor dalam quality control tahap akhir.`,
    supervisorNotes: `Yang bersangkutan menunjukkan perkembangan positif dalam hal produktivitas dan kemandirian kerja. Namun dia masih perlu dibimbing dalam hal dokumentasi kerja dan komunikasi tim. Disarankan untuk mengikuti pelatihan pencatatan hasil produksi dan briefing rutin. Jika perkembangan tetap stabil, dia dapat diberikan rotasi sementara ke posisi QC untuk meningkatkan ketelitian. Tunjangan insentif masih perlu dipertahankan menjadi target tercapai kuartal ini.`,
  };

  const mockAssessmentProps = {
    assessmentName: "Assessment Product Design Lead 1.0",
    summaryData: [
      { kategori: "Hasil (70%)", score: 3.36, maxScore: 5.0 },
      { kategori: "Proses (30%)", score: 1.38, maxScore: 5.0 },
    ],
    totalScore: 4.74,
    penaltyPoint: -10,
    nilaiKinerja: 84.8,
    tingkatKinerja: "B",
    categories: categories,
  };

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
              {mockAssessmentProps.assessmentName}
            </p>
          </div>
        </div>
      </div>

      <AssessmentSummaryTable data={mockTableData} />
      <div className="flex gap-2 items-center">
        <h3 className="font-semibold text-lg text-black">
          Supervisor Assessment Details
        </h3>
      </div>

      {categories.map((category) => (
        <CategoryDetails key={category.id} category={category} />
      ))}
      {notes && <NotesSection notes={notes} />}
    </div>
  );
};

export default SupervisorAssessmentResult;
