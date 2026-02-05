import { useState } from "react";
import { toast } from "sonner";
import { WorkoutHistoryEntry } from "@/types/workout";
import { fetchWorkoutDetail } from "@/lib/home-data";

export const useHistoryDetail = () => {
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
    const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<WorkoutHistoryEntry | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const handleViewWorkoutDetail = async (workoutId: string, onSuccess?: () => void) => {
        setSelectedWorkoutId(workoutId);
        setSelectedWorkoutDetail(null);
        setIsLoadingDetail(true);

        try {
            const detail = await fetchWorkoutDetail(workoutId);
            if (detail) {
                setSelectedWorkoutDetail(detail);
                if (onSuccess) onSuccess();
            } else {
                toast.error("Couldn't load workout details");
            }
        } catch (err) {
            console.error('Error fetching workout detail:', err);
            toast.error("Failed to load workout");
        } finally {
            setIsLoadingDetail(false);
        }
    };

    return {
        selectedWorkoutId,
        selectedWorkoutDetail,
        isLoadingDetail,
        handleViewWorkoutDetail,
        setSelectedWorkoutId, // Exposed for clearing if needed
        setSelectedWorkoutDetail
    };
};
