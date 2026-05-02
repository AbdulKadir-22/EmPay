import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await dashboardAPI.getEmployees();
      return response.data.data.users || [];
    },
  });
};
