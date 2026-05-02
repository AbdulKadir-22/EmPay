import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveAPI } from '../services/api';

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['leaveTypes'],
    queryFn: async () => {
      const response = await leaveAPI.getTypes();
      return response.data.data.types || [];
    },
  });
};

export const useMyLeaveAllocations = (year) => {
  return useQuery({
    queryKey: ['leaveAllocations', year],
    queryFn: async () => {
      const response = await leaveAPI.getMyAllocations(year);
      return response.data.data.allocations || [];
    },
  });
};

export const useMyLeaveHistory = () => {
  return useQuery({
    queryKey: ['leaveHistory'],
    queryFn: async () => {
      const response = await leaveAPI.getMyHistory();
      return response.data.data.history || [];
    },
  });
};

export const usePendingLeaveRequests = (isEnabled = false) => {
  return useQuery({
    queryKey: ['pendingLeaves'],
    queryFn: async () => {
      const response = await leaveAPI.getPending();
      return response.data.data.requests || [];
    },
    enabled: isEnabled,
  });
};

export const useRequestLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => leaveAPI.request(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveHistory'] });
      queryClient.invalidateQueries({ queryKey: ['leaveAllocations'] });
    },
  });
};

export const useUpdateLeaveStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, status, comment }) => 
      leaveAPI.updateStatus(requestId, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveHistory'] });
      queryClient.invalidateQueries({ queryKey: ['leaveAllocations'] });
    },
  });
};
