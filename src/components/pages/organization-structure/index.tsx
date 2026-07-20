'use client';

import Image from 'next/image';
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  ReactFlowProvider,
  type Node,
  type Edge,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';
import { transformDataForFlow } from './data-transformer';
import { CustomNode } from './sections/custom-node';
import { CustomControls } from './sections/custom-controls';
import { flattenOrgData } from './utils';
import { getOrgChart } from '@/services/employees/organization-structure';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { EmployeeNode, NodeCardData } from './types';
import DownloadButton from './sections/download-button';
import { getEmployees } from '@/services/employees';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchableSelect } from '@/components/ui/combobox';
import { useTranslations } from 'next-intl';
import { OrgChartDepthFilter } from './sections/org-chart-depth-filter';
import { OrgChartFitView } from './sections/org-chart-fit-view';
import { Can } from '@/components/auth/can';

const nodeWidth = 220;
const nodeHeight = 140;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB',
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });
  const isHorizontal = direction === 'LR';
  nodes.forEach((node: Node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);
  const layoutedNodes = nodes.map((node) => {
    const layout = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: layout.x - nodeWidth / 2,
        y: layout.y - nodeHeight / 2,
      },
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
    };
  });
  return { nodes: layoutedNodes, edges };
};

const nodeTypes = { custom: CustomNode };

interface OrganizationChartProps {
  isEmployee?: boolean;
}

export default function OrganizationChart({
  isEmployee = false,
}: OrganizationChartProps) {
  const router = useRouter();
  const t = useTranslations('employee');
  const tCommon = useTranslations('common');
  const [user, setUser] = React.useState<{ name: string; id: string } | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [search, setSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [maxDepth, setMaxDepth] = useState<number | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('user');
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
        setUser(parsedUser);

        if (isEmployee && parsedUser?.id) {
          setSelectedEmployeeId(parsedUser.profile_id);
        }
        setIsHydrated(true);
      }
    } catch {
      setIsHydrated(true);
    }
  }, []);

  const debouncedSearch = useDebounce(search, 300);

  const { data: employeeResults, isLoading: isSearching } = useQuery({
    queryKey: ['employees', 'search', debouncedSearch],
    queryFn: () =>
      getEmployees(
        debouncedSearch
          ? { search: debouncedSearch, per_page: 20 }
          : { per_page: 20 },
      ),
    staleTime: 5 * 60 * 1000,
    enabled: isHydrated,
  });

  const employeeOptions = useMemo(() => {
    return (
      employeeResults?.data?.data?.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      })) || []
    );
  }, [employeeResults?.data]);

  const {
    data: chartEmployees = [],
    isLoading,
    isError,
  } = useQuery<EmployeeNode[], Error>({
    queryKey: ['orgChart', selectedEmployeeId, maxDepth],
    queryFn: async () => {
      const response = await getOrgChart(selectedEmployeeId || '', maxDepth);
      return flattenOrgData(response.data);
    },
    staleTime: 1000 * 60 * 5,
    enabled: isHydrated && (isEmployee ? !!selectedEmployeeId : true),
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeCardData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const layoutResult = useMemo(() => {
    if (!chartEmployees || chartEmployees.length === 0) return null;
    const dataForNodes: NodeCardData[] = chartEmployees.map((emp) => ({
      employee: emp,
      isEditMode: false,
    }));
    const transformed = transformDataForFlow(dataForNodes);
    return getLayoutedElements(transformed.nodes, transformed.edges);
  }, [chartEmployees]);

  useEffect(() => {
    if (!layoutResult) {
      setNodes([]);
      setEdges([]);
      return;
    }
    setNodes(layoutResult.nodes as Node<NodeCardData>[]);
    setEdges(layoutResult.edges);
  }, [layoutResult]);

  const fitViewTrigger = `${selectedEmployeeId ?? 'all'}:${maxDepth ?? 'all'}:${nodes.length}`;

  const handleEditClick = () => {
    router.push('structure/edit');
  };

  if (!isHydrated) return null;

  return (
    <ReactFlowProvider>
      <div className="font-sans min-h-screen">
        {!isEmployee ? (
          <div className="flex justify-between w-full items-center mb-3">
            <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
              <div className="flex gap-4 items-center flex-wrap">
                <h2 className="font-semibold text-xl">
                  {t('orgStructure')}
                </h2>

                <SearchableSelect
                  value={selectedEmployeeId}
                  onValueChange={(value) =>
                    setSelectedEmployeeId(value ? value.toString() : null)
                  }
                  options={employeeOptions}
                  placeholder={t('filterByEmployee')}
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder={t('searchEmployee')}
                  emptyMessage={t('noEmployeeFound')}
                  isLoading={isSearching}
                  loadingMessage={tCommon('loading')}
                  className="w-[250px] bg-white"
                  popoverClassName="w-[250px]"
                />

                <OrgChartDepthFilter
                  value={maxDepth}
                  onChange={setMaxDepth}
                />
              </div>
              <div className="flex flex-row gap-2">
                <Can permission="employee_organization.organization_structure.export">
                  <DownloadButton />
                </Can>
                <Can permission="employee_organization.organization_structure.edit">
                  <Button onClick={handleEditClick} className="whitespace-nowrap">
                    <Image
                      src="/icons/edit.svg"
                      width={18}
                      height={18}
                      alt="edit icon"
                    />
                    {t('editStructure')}
                  </Button>
                </Can>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
            <h2 className="font-semibold text-xl">
              {t('myOrgStructure')}
            </h2>
            <OrgChartDepthFilter
              value={maxDepth}
              onChange={setMaxDepth}
            />
          </div>
        )}

        <div style={{ width: '100%', height: '80vh' }}>
          {isError && <div>{t('failedLoadOrgChart')}</div>}

          {!isLoading && !isError && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              style={{ backgroundColor: '#EDEDED' }}
              className="bg-grayscale-10"
            >
              <Background />
              <CustomControls />
              <OrgChartFitView
                trigger={fitViewTrigger}
                enabled={nodes.length > 0}
              />
            </ReactFlow>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}