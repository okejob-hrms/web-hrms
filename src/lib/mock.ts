export const MOCK_EXIT_FIELDS = [
  {
    id: 1,
    type: 'checkbox',
    label: 'Reason for Leaving',
    order: 1,
    isRequired: true,
    options: [
      'Better career opportunity',
      'Salary/Compensation',
      'Work-life balance',
      'Relationship with supervisor',
      'Relocation',
      'Others'
    ]
  },
  {
    id: 2,
    type: 'range',
    label: 'Compensation & Benefits',
    order: 2,
    isRequired: true,
    options: { min: 1, max: 9 },
    metadata: { is_note: true }
  },
  {
    id: 3,
    type: 'textarea',
    label: 'Final Comments',
    order: 9,
    isRequired: false
  }
];


export const MOCK_OFFBOARDING = {
    "status": "success",
    "message": "Offboarding fetched successfully",
    "data": {
        "id": 1,
        "user_id": 1,
        "status": 1,
        "effective_resignation_date": "2025-10-14T00:00:00.000000Z",
        "last_working_date": "2025-10-14T00:00:00.000000Z",
        "form_id": 1,
        "created_at": "2025-09-14T16:32:26.000000Z",
        "updated_at": "2025-09-14T16:32:26.000000Z",
        "status_label": "In Progress"
    }
}