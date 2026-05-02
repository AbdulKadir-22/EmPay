import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceAPI } from '../services/api';

export const useTodayAttendance = () => {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      try {
        const res = await attendanceAPI.getTodayStatus();
        return res.data.data.attendance;
      } catch (err) {
        return null;
      }
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useAttendanceSummary = (params) => {
  return useQuery({
    queryKey: ['attendance', 'summary', params],
    queryFn: async () => {
      const res = await attendanceAPI.getSummary(params);
      return res.data.data.summary || [];
    },
  });
};

export const useClockIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => attendanceAPI.clockIn(),
    onSuccess: (res) => {
      queryClient.setQueryData(['attendance', 'today'], res.data.data.attendance);
      queryClient.invalidateQueries({ queryKey: ['attendance', 'summary'] });
    },
  });
};

export const useClockOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => attendanceAPI.clockOut(),
    onSuccess: (res) => {
      queryClient.setQueryData(['attendance', 'today'], res.data.data.attendance);
      queryClient.invalidateQueries({ queryKey: ['attendance', 'summary'] });
    },
  });
};
