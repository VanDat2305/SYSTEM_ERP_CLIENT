export const getStatusClass = (status: string): string => {
    const baseClass = 'px-2 py-0.5 rounded-full';
    
    const variants = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      banned: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      deleted: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    
    return `${baseClass} ${variants[status as keyof typeof variants] || variants.deleted}`;
  };
  