export const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara',
];

export const BUDGET_OPTIONS = [
  { label: 'Below ₦100k',     min: '',        max: '100000'  },
  { label: '₦100k – ₦300k',   min: '100000',  max: '300000'  },
  { label: '₦300k – ₦500k',   min: '300000',  max: '500000'  },
  { label: '₦500k – ₦1M',     min: '500000',  max: '1000000' },
  { label: 'Above ₦1M',       min: '1000000', max: ''        },
];

export const EMPTY_FILTERS = { search: '', state: '', type: '', level: '', curriculum: '', minFee: '', maxFee: '' };
