export const toRomanNumeral = (num: number): string => {
  const romanNumerals: { [key: number]: string } = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X",
    11: "XI",
    12: "XII",
    13: "XIII",
    14: "XIV",
    15: "XV",
    16: "XVI",
    17: "XVII",
    18: "XVIII",
    19: "XIX",
    20: "XX",
  };

  if (num <= 0 || num > 20) {
    return num.toString();
  }

  return romanNumerals[num] || num.toString();
};

export const formatDuration = (seconds: number | null): string => {
  if (seconds === null || seconds === undefined) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const formatPrice = (price: number): string =>
  `${new Intl.NumberFormat("vi-VN").format(price)}₫`;

export const getApprovalStatusText = (
  status: "Approved" | "Pending" | "Rejected"
): string => {
  switch (status) {
    case "Approved":
      return "Đã được chấp thuận";
    case "Pending":
      return "Đang chờ quản trị viên duyệt";
    case "Rejected":
      return "Đã bị từ chối";
    default:
      return status;
  }
};

export const getApprovalStatusColor = (
  status: "Approved" | "Pending" | "Rejected"
): string => {
  switch (status) {
    case "Approved":
      return "bg-mint/20 dark:bg-gold/20 border-mint dark:border-gold";
    case "Pending":
      return "bg-yellow-500/20 border-yellow-500";
    case "Rejected":
      return "bg-coral/20 border-coral";
    default:
      return "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600";
  }
};

export const getApprovalStatusTextColor = (
  status: "Approved" | "Pending" | "Rejected"
): string => {
  switch (status) {
    case "Approved":
      return "text-mint dark:text-gold";
    case "Pending":
      return "text-yellow-600 dark:text-yellow-400";
    case "Rejected":
      return "text-coral";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

