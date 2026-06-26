import { useCallback, useEffect, useState } from "react";
import { getTeacherClasses, getClassStudents, getStudentDetail } from "../lib/api";
import type { ClassSummary, StudentDetail, StudentSummary } from "../types/teacher";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Đã có lỗi xảy ra";
}

export function useTeacherClasses(): AsyncState<ClassSummary[]> {
  const [data, setData] = useState<ClassSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTeacherClasses();
      setData(response.classes);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useClassStudents(classId: string | null): AsyncState<StudentSummary[]> {
  const [data, setData] = useState<StudentSummary[] | null>(null);
  const [loading, setLoading] = useState(Boolean(classId));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!classId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getClassStudents(classId);
      setData(response.students);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useStudentDetail(classId: string, userId: string): AsyncState<StudentDetail> {
  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudentDetail(classId, userId);
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [classId, userId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
