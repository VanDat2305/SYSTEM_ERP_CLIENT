// src/composables/useToast.ts
import Swal, { type SweetAlertIcon } from "sweetalert2";

/**
 * Hiển thị thông báo Toast sử dụng SweetAlert2.
 * @param type - Loại icon: "success" | "error" | "warning" | "info" | "question"
 * @param title - Tiêu đề thông báo
 * @param duration - Thời gian hiển thị (ms) [Mặc định: 3000ms]
 */
export function useToast() {
  let toastQueue: any[] = []; // Danh sách các toast

  const showToast = ({
    type = "info",
    title = "Thông báo",
    duration = 3000,
  }: {
    type: SweetAlertIcon;
    title: string;
    duration?: number;
  }) => {
    toastQueue.push({
      icon: type,
      title: title,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      didOpen: (toast: { addEventListener: (arg0: string, arg1: { (): number | undefined; (): number | undefined; }) => void; }) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    // Chạy queue
    if (toastQueue.length === 1) {
      processQueue();
    }
  };

  const processQueue = async () => {
    while (toastQueue.length > 0) {
      await Swal.fire(toastQueue[0]);
      toastQueue.shift(); // Xóa Toast đã hiển thị xong
    }
  };

  return { showToast };
}
