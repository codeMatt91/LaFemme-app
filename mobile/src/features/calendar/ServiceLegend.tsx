import { ScrollView, Text } from "react-native";
import { getContrastingTextColor } from "@/lib/colors";
import type { ServiceType } from "./types";

export function ServiceLegend({ serviceTypes }: { serviceTypes: ServiceType[] }) {
  if (serviceTypes.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="max-h-9 flex-grow-0 border-b border-border bg-background"
      contentContainerClassName="items-center gap-2 px-4 py-1.5"
    >
      {serviceTypes.map((s) => (
        <Text
          key={s.id}
          className="overflow-hidden rounded border px-2 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: s.color, borderColor: s.color, color: getContrastingTextColor(s.color) }}
        >
          {s.name}
        </Text>
      ))}
    </ScrollView>
  );
}
