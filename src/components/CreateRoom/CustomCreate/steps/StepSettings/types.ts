import { Variants } from 'framer-motion';

export type TooltipId = 'participants' | 'timer' | 'deadline' | 'reminders' | null;

export interface SettingHeaderProps {
  icon: React.ReactNode;
  iconBgClass: string;
  iconColor: string;
  label: string;
  tooltipId: Exclude<TooltipId, null>;
  tooltipContent: string;
  onTooltipHover: (id: TooltipId) => void;
  activeTooltip: TooltipId;
}

export interface OptionButtonProps {
  isActive: boolean;
  icon: React.ReactNode;
  activeIconColor: string;
  title: string;
  description: string;
  onClick: () => void;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
}

export interface StepSettingsProps {
  participantLimit: number | null;
  setParticipantLimit: (limit: number | null) => void;
  timerOption: string;
  handleTimerOptionChange: (value: string) => void;
  customDuration: string;
  setCustomDuration: (duration: string) => void;
  durationUnit: 'minutes' | 'hours';
  setDurationUnit: (unit: 'minutes' | 'hours') => void;
  deadline: string;
  setDeadline: (deadline: string) => void;
  reminders: boolean;
  setReminders: (enabled: boolean) => void;
  isLoading?: boolean;
  accessControl?: boolean | null;
  setAccessControl?: (control: boolean | null) => void;
}

export interface ParticipantLimitSectionProps {
  participantLimit: number | null;
  setParticipantLimit: (limit: number | null) => void;
  showHelpTooltip: 'participants' | 'timer' | 'deadline' | 'reminders' | null;
  setShowHelpTooltip: (tooltip: 'participants' | 'timer' | 'deadline' | 'reminders' | null) => void;
  accessControl?: boolean | null;
  setAccessControl?: (control: boolean | null) => void;
}

export interface TimerSettingsSectionProps {
  timerOption: string;
  handleTimerOptionChange: (value: string) => void;
  customDuration: string;
  setCustomDuration: (duration: string) => void;
  durationUnit: 'minutes' | 'hours';
  setDurationUnit: (unit: 'minutes' | 'hours') => void;
  showHelpTooltip: 'participants' | 'timer' | 'deadline' | 'reminders' | null;
  setShowHelpTooltip: (tooltip: 'participants' | 'timer' | 'deadline' | 'reminders' | null) => void;
}

export interface DeadlineSectionProps {
  deadline: string;
  setDeadline: (deadline: string) => void;
  minDate: string;
  showHelpTooltip: 'participants' | 'timer' | 'deadline' | 'reminders' | null;
  setShowHelpTooltip: (tooltip: 'participants' | 'timer' | 'deadline' | 'reminders' | null) => void;
}

export interface RemindersSectionProps {
  reminders: boolean;
  setReminders: (enabled: boolean) => void;
  deadline: string;
  showHelpTooltip: 'participants' | 'timer' | 'deadline' | 'reminders' | null;
  setShowHelpTooltip: (tooltip: 'participants' | 'timer' | 'deadline' | 'reminders' | null) => void;
}

// Animation variants
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1
    }
  }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
}; 