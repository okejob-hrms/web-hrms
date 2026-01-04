import * as React from "react";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { rupiahFormatter } from "@/lib/helpers";
import { FamilyInformationSection } from "../../employee-management-form/sections/family-information-section";
import { FormalEducationSection } from "../../employee-management-form/sections/formal-education-section";
import { NonFormalEducationSection } from "../../employee-management-form/sections/non-formal-education-section";
import { WorkExperienceSection } from "../../employee-management-form/sections/work-experience-section";
import { ContactOfReferenceSection } from "../../employee-management-form/sections/contact-reference-section";
import { IEmployeeDetailsResponse } from "@/services/employees/types";
import { getEmployeeDetail } from "@/services/employees";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit3, Plus, Trash, Upload, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFace, postFace, removeFace } from "@/services/face-recognitions";
import { FaceRequest, FaceResponse } from "@/services/face-recognitions/types";
import { toast } from "sonner";

dayjs.extend(localizedFormat);

interface Props {
  data: IEmployeeDetailsResponse;
}

interface DirectReportEmployee {
  id: number;
  name: string;
  position: string;
  department: string;
}

const formatDate = (date: string | null | undefined): string => {
  if (!date) return "-";
  try {
    const formatted = dayjs(date).format("LL");
    return formatted === "Invalid date" ? "-" : formatted;
  } catch {
    return "-";
  }
};

const formatCurrency = (amount: string | number | null | undefined): string => {
  if (!amount || amount === 0) return "-";
  try {
    return rupiahFormatter(Number(amount));
  } catch {
    return "-";
  }
};

const safeGet = (value: string | number): string => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).trim() || "-";
};

interface SocialMediaItemProps {
  type: string;
  url: string;
}

const SocialMediaItem: React.FC<SocialMediaItemProps> = ({ type, url }) => {
  const getSocialMediaIcon = (type: string) => {
    const normalizedType = type.toLowerCase().trim();

    switch (normalizedType) {
      case "instagram":
        return (
          <Image
            src="/icons/instagram.svg"
            width={16}
            height={16}
            alt="instagram"
          />
        );
      case "twitter":
      case "x":
        return (
          <Image src="/icons/x.svg" width={16} height={16} alt="instagram" />
        );
      case "linkedin":
        return (
          <Image
            src="/icons/linkedin.svg"
            width={16}
            height={16}
            alt="instagram"
          />
        );
      case "facebook":
        return (
          <Image
            src="/icons/facebook.svg"
            width={16}
            height={16}
            alt="instagram"
          />
        );
      case "youtube":
        return (
          <Image
            src="/icons/youtube.svg"
            width={16}
            height={16}
            alt="instagram"
          />
        );
      case "github":
        return (
          <Image
            src="/icons/github.svg"
            width={16}
            height={16}
            alt="instagram"
          />
        );
      case "website":
      case "web":
      case "blog":
        return (
          <Image src="/icons/web.svg" width={16} height={16} alt="instagram" />
        );
      default:
        return (
          <Image src="/icons/link.svg" width={16} height={16} alt="instagram" />
        );
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getSocialMediaIcon(type)}
      <span className="text-foreground text-base">{url}</span>
    </div>
  );
};

export const PersonalInformationDetail = React.memo(
  function PersonalInformationDetail({ data }: Props) {
    const [primaryDirectReports, setPrimaryDirectReports] = React.useState<
      DirectReportEmployee[]
    >([]);
    const [additionalDirectReports, setAdditionalDirectReports] =
      React.useState<DirectReportEmployee[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [showFormFace, setShowFormFace] = React.useState(false);
    const [loadingFace, setLoadingFace] = React.useState(false);
    const queryClient = useQueryClient();

    React.useEffect(() => {
      const fetchDirectReports = async () => {
        try {
          setIsLoading(true);
          setError(null);

          if (
            !data?.reporting_relationships ||
            data.reporting_relationships.length === 0
          ) {
            setIsLoading(false);
            return;
          }

          const primaryRelationships = data.reporting_relationships.filter(
            (item) => item?.relationship_type === "primary",
          );
          const secondaryRelationships = data.reporting_relationships.filter(
            (item) => item?.relationship_type === "secondary",
          );

          const primaryReportsPromises = primaryRelationships.map(
            async (relationship) => {
              try {
                if (!relationship?.direct_report_id) return null;

                const employeeResponse = await getEmployeeDetail(
                  relationship.direct_report_id,
                );

                const employee = employeeResponse?.data;
                if (!employee) return null;

                return {
                  id: employee.id || 0,
                  name: employee.user?.name || "Unknown",
                  position:
                    employee.employment?.job_position?.name ||
                    "Unknown Position",
                  department:
                    employee.employment?.department?.name ||
                    "Unknown Department",
                };
              } catch (error) {
                console.error(
                  `Failed to fetch employee ${relationship.direct_report_id}:`,
                  error,
                );
                return null;
              }
            },
          );

          const additionalReportsPromises = secondaryRelationships.map(
            async (relationship) => {
              try {
                if (!relationship?.direct_report_id) return null;

                const employeeResponse = await getEmployeeDetail(
                  relationship.direct_report_id,
                );

                const employee = employeeResponse?.data;
                if (!employee) return null;

                return {
                  id: employee.id || 0,
                  name: employee.user?.name || "Unknown",
                  position:
                    employee.employment?.job_position?.name ||
                    "Unknown Position",
                  department:
                    employee.employment?.department?.name ||
                    "Unknown Department",
                };
              } catch (error) {
                console.error(
                  `Failed to fetch employee ${relationship.direct_report_id}:`,
                  error,
                );
                return null;
              }
            },
          );

          const [primaryResults, additionalResults] = await Promise.all([
            Promise.all(primaryReportsPromises),
            Promise.all(additionalReportsPromises),
          ]);

          setPrimaryDirectReports(
            primaryResults.filter(
              (item): item is DirectReportEmployee => item !== null,
            ),
          );
          setAdditionalDirectReports(
            additionalResults.filter(
              (item): item is DirectReportEmployee => item !== null,
            ),
          );
        } catch (error) {
          console.error("Error fetching direct reports:", error);
          setError("Failed to load direct reports");
        } finally {
          setIsLoading(false);
        }
      };

      if (
        data?.reporting_relationships &&
        data.reporting_relationships.length > 0
      ) {
        fetchDirectReports();
      }
    }, [data?.reporting_relationships]);

    const { data: faces, refetch: faceRefetch } = useQuery<FaceResponse>({
      queryKey: ["getFaces", data?.user_id],
      queryFn: () => getFace(data?.user_id),
      staleTime: 1000 * 60 * 5,
    });

    const deleteMutation = useMutation<FaceResponse, Error, number>({
      mutationFn: (id) => removeFace(id),
      onMutate: () => setLoadingFace(true),
      onSuccess: () => {
        toast.success("Face deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["getFaces"] });
        faceRefetch();
      },
      onError: (err) => {
        toast.error(`Failed to delete: ${err.message}`);
      },
      onSettled: () => setLoadingFace(false),
    });

    const saveMutation = useMutation<
      FaceResponse,
      Error,
      { data: FaceRequest }
    >({
      mutationFn: ({ data }) => {
        return postFace(data);
      },
      onMutate: () => setLoadingFace(true),
      onSuccess: () => {
        toast.success("Score successfully save");
        queryClient.invalidateQueries({ queryKey: ["getFaces"] });
        faceRefetch();
      },
      onError: (err) => {
        console.log(err);
        toast.error(`Failed to save a face recognition`);
      },
      onSettled: () => setLoadingFace(false),
    });

    if (!data) {
      return (
        <div className="flex flex-col w-full gap-4 p-2">
          <div className="text-center text-gray-500">
            No employee data available
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full gap-4 p-2">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Personal Information
          </h2>
          <div className="flex flex-col md:col-span-3 gap-2">
            <p className="text-sm text-text-disabled">Face Recognition</p>
            <div className="grid grid-cols-2 md:grid-cols-8 gap-2">
              {faces?.data.faces.map((item, i) => {
                return (
                  <div
                    className="col-span-1 p-4 border rounded-lg flex items-center justify-center flex-col relative"
                    key={i}
                  >
                    <Image
                      src={item.image_url}
                      height={100}
                      width={100}
                      alt="face"
                    />
                    {showFormFace && (
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-400 rounded-lg flex items-center justify-center p-2 cursor-pointer"
                        onClick={() => deleteMutation.mutate(Number(item.id))}
                      >
                        <X size={18} color="#fff" />
                      </button>
                    )}
                  </div>
                );
              })}

              {showFormFace && (
                <div className="col-span-1 p-4 border rounded-lg flex items-center justify-center flex-col relative">
                  <button
                    type="button"
                    className="w-full h-full flex flex-col items-center justify-center p-2 cursor-pointer"
                    onClick={() =>
                      document.getElementById("front-file")?.click()
                    }
                    disabled={loadingFace}
                  >
                    <Plus size={38} className="mb-3" />
                    <div className="text-center text-gray-400 text-sm">
                      Add new face
                    </div>
                  </button>

                  <input
                    type="file"
                    accept="image/*"
                    id="front-file"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      setLoadingFace(true);
                      if (selectedFile) {
                        const payload = {
                          file: selectedFile,
                          user_id: data.user_id,
                        };

                        saveMutation.mutate({ data: payload });
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-52"
              onClick={() => setShowFormFace(!showFormFace)}
              isLoading={loadingFace}
            >
              <Upload /> {showFormFace ? "Submit" : "Edit"} Face Recognition
            </Button>
            {/* <CardItem /> */}
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">User Role</p>
            <p>{safeGet(data.employment?.job_level?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Email</p>
            <p>{safeGet(data.user?.email)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Phone Number</p>
            <p>{safeGet(data.phone_number)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Gender</p>
            <p>{safeGet(data.gender)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Place of Birth</p>
            <p>{safeGet(data.place_of_birth)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Born Date</p>
            <p>{formatDate(data.date_of_birth)}</p>
          </div>
          <div className="grid grid-cols-2">
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Marital Status</p>
              <p>{safeGet(data.marital_status_label)}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Blood Type</p>
              <p>{safeGet(data.blood_type)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Height</p>
              <p>{safeGet(data.height)}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Weight</p>
              <p>{safeGet(data.weight)}</p>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">ID Number</p>
            <p>{safeGet(data.id_number)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              Taxpayer ID Number (NPWP)
            </p>
            <p>{safeGet(data.npwp)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              Health Insurance Number (BPJS)
            </p>
            <p>{safeGet(data.bpjs)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Hobby</p>
            <p>{safeGet(data.hobby)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Citizen ID Address</p>
            <p>{safeGet(data.citizen_id_address)}</p>
          </div>
          <div className="flex flex-col col-start-1">
            <p className="text-sm text-text-disabled">Residental Address</p>
            <p>{safeGet(data.residential_address)}</p>
          </div>
          <div className="flex flex-col col-start-1 col-span-3">
            <p className="text-sm text-text-disabled">Achievement</p>
            <p>{safeGet(data.achievement)}</p>
          </div>
          <div className="flex flex-col col-start-1 col-span-3">
            <p className="text-sm text-text-disabled">Personal Description</p>
            <p>{safeGet(data.personal_description)}</p>
          </div>
          <div className="flex flex-col col-start-1 col-span-3">
            <p className="text-sm text-text-disabled">Social Media</p>
            <div className="flex flex-col gap-2">
              {data.social_media_accounts &&
              data.social_media_accounts.length > 0 ? (
                data.social_media_accounts
                  .filter((account) => account?.url && account?.type)
                  .map((account) => (
                    <SocialMediaItem
                      key={account.id}
                      type={account.type}
                      url={account.url}
                    />
                  ))
              ) : (
                <p className="text-sm text-gray-500">-</p>
              )}
            </div>
          </div>
          <Separator className="md:col-span-3" />
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Employee Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Position</p>
            <p>{safeGet(data.employment?.job_position?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Department</p>
            <p>{safeGet(data.employment?.department?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Job Level</p>
            <p>{safeGet(data.employment?.job_level?.name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Primary Direct Report</p>
            <div>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : error ? (
                <p className="text-sm text-red-500">Failed to load</p>
              ) : primaryDirectReports.length > 0 ? (
                <div className="space-y-1">
                  {primaryDirectReports.map((employee) => (
                    <div key={employee.id} className="text-sm">
                      <span className="font-normal text-base text-foreground">
                        {employee.name}
                      </span>
                      <span className="text-text-disabled text-base">
                        {" "}
                        ({employee.position})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">-</p>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              Additional Direct Report
            </p>
            <div>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : error ? (
                <p className="text-sm text-red-500">Failed to load</p>
              ) : additionalDirectReports.length > 0 ? (
                <div className="space-y-1">
                  {additionalDirectReports.map((employee) => (
                    <div key={employee.id} className="text-sm">
                      <span className="font-normal text-base text-foreground">
                        {employee.name}
                      </span>
                      <span className="text-text-disabled text-base">
                        {" "}
                        ({employee.position})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">-</p>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Team</p>
            <p>{data.team_member && data.team_member.name}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Employee Start Date</p>
            <p>{formatDate(data.employment?.start_date)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Employee End Date</p>
            <p>{formatDate(data.employment?.end_date)}</p>
          </div>
          <Separator className="md:col-span-3" />
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Salary Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Base Salary</p>
            <p>{formatCurrency(data.employment?.base_salary)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Salary (Nett)</p>
            <p>{formatCurrency(data.employment?.salary_nett)}</p>
          </div>
          <Separator className="md:col-span-3" />
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Bank Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Bank</p>
            <p>{safeGet(data.bank_account?.bank.bank_name)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Account Number</p>
            <p>{safeGet(data.bank_account?.account_number)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Account Name</p>
            <p>{safeGet(data.bank_account?.account_name)}</p>
          </div>
          <Separator className="md:col-span-3" />
        </div>

        <FamilyInformationSection
          employee_profile_id={data.employment?.employee_profile_id || 0}
          withAddButton
        />
        <FormalEducationSection
          employee_profile_id={data.employment?.employee_profile_id || 0}
          withAddButton
        />
        <NonFormalEducationSection
          employee_profile_id={data.employment?.employee_profile_id || 0}
          withAddButton
        />
        <WorkExperienceSection
          employee_profile_id={data.employment?.employee_profile_id || 0}
          withAddButton
        />
        <ContactOfReferenceSection
          employee_profile_id={data.employment?.employee_profile_id || 0}
          withAddButton
        />
      </div>
    );
  },
);
