/* eslint-disable react-hooks/exhaustive-deps */
// FileName: index.tsx
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

// --- NEW IMPORTS FOR FILTERING ---
import { getEmployees } from '@/services/employees';
import { useDebounce } from '@/hooks/use-debounce';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Dagre fixed sizes
const nodeWidth = 220;
const nodeHeight = 140;

// --- FIXED: recreate dagre graph per layout call ---
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

// --- NODE TYPES ---
const nodeTypes = { custom: CustomNode };

interface OrganizationChartProps {
  isEmployee?: boolean;
}

export default function OrganizationChart({
  isEmployee = false,
}: OrganizationChartProps) {
  const router = useRouter();
  const [user, setUser] = React.useState({ name: '', id: '' });

  // Only access localStorage on the client side
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    }
  }, []);

  // --- 1. FILTER STATE ---
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    isEmployee ? user.id : null,
  );
  const [selectedLabel, setSelectedLabel] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  // --- 2. SEARCH QUERY ---
  const { data: employeeResults, isLoading: isSearching } = useQuery({
    queryKey: ['employees', 'search', debouncedSearch],
    queryFn: () =>
      getEmployees(
        debouncedSearch
          ? { search: debouncedSearch, per_page: 20 }
          : { per_page: 20 },
      ),
    staleTime: 5 * 60 * 1000,
  });

  const employeeOptions = useMemo(() => {
    return (
      employeeResults?.data?.data?.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      })) || []
    );
  }, [employeeResults?.data]);

  // --- 3. CHART QUERY ---
  const {
    data: chartEmployees = [],
    isLoading,
    isError,
  } = useQuery<EmployeeNode[], Error>({
    queryKey: ['orgChart', selectedEmployeeId],
    queryFn: async () => {
      const response = await getOrgChart(selectedEmployeeId || '');
      return flattenOrgData(response.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeCardData>>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // --- 4. TRANSFORMATION + LAYOUT (Memoized for stability) ---
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

  const handleEditClick = () => {
    router.push('structure/edit');
  };

  return (
    <ReactFlowProvider>
      <div className="font-sans min-h-screen">
        {!isEmployee ? (
          <div className="flex justify-between w-full items-center mb-3">
            <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
              {/* LEFT SECTION */}
              <div className="flex gap-4 items-center flex-wrap">
                <h2 className="font-semibold text-xl">
                  Organization Structure
                </h2>

                {/* FILTER */}
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[250px] justify-between bg-white"
                    >
                      {selectedLabel || 'Filter by employee'}

                      {selectedEmployeeId ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmployeeId(null);
                            setSelectedLabel('');
                            setSearch('');
                          }}
                          className="ml-2 rounded-full hover:bg-gray-200 p-1"
                        >
                          <X className="h-3 w-3 opacity-50" />
                        </div>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[250px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search employee name..."
                        value={search}
                        onValueChange={setSearch}
                      />

                      <CommandList>
                        {isSearching ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Loading...
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No employee found.</CommandEmpty>
                            <CommandGroup>
                              {employeeOptions.map((item) => (
                                <CommandItem
                                  key={item.value}
                                  value={item.value}
                                  onSelect={() => {
                                    setSelectedEmployeeId(item.value);
                                    setSelectedLabel(item.label);
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      selectedEmployeeId === item.value
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                    )}
                                  />
                                  {item.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex flex-row gap-2">
                <DownloadButton />

                <Button onClick={handleEditClick} className="whitespace-nowrap">
                  <Image
                    src="/icons/edit.svg"
                    width={18}
                    height={18}
                    alt="edit icon"
                  />
                  Edit Structure
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <h2 className="font-semibold text-xl mb-3">
            My Organization Structure
          </h2>
        )}

        {/* CHART AREA */}
        <div style={{ width: '100%', height: '80vh' }}>
          {isError && <div>Failed to load organization chart</div>}

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
            </ReactFlow>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
