import { useState } from "react";
import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from "react-native-svg";
import { formatCurrency } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { SERIES_COLORS, labelStride, niceScale } from "./chartScale";
import type { ChartPoint } from "./types";

const HEIGHT = 320;
const PAD = { top: 8, right: 8, bottom: 24, left: 56 };
const BAR_FILL_OPACITY = 0.85;

// Come FinancialChart (recharts) del web: barre entrate e uscite, linea del
// profitto netto, legenda. Toccando un giorno/mese si vedono i valori.
export function FinancialChart({ data }: { data: ChartPoint[] }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <View className="h-64 items-center justify-center">
        <Text className="text-sm text-muted-foreground">Nessun dato disponibile per il periodo selezionato</Text>
      </View>
    );
  }

  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const scale = niceScale(data.flatMap((d) => [d.entrate, d.uscite, d.profitto]));
  const y = (v: number) => PAD.top + plotH - ((v - scale.min) / (scale.max - scale.min)) * plotH;
  const band = plotW / data.length;
  const barW = Math.max(1, Math.min(40, band * 0.35));
  const cx = (i: number) => PAD.left + band * i + band / 2;
  const stride = labelStride(data.length, Math.max(1, Math.floor(plotW / 44)));
  const point = selected != null ? data[selected] : null;

  return (
    <View>
      <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ height: HEIGHT }}>
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            {scale.ticks.map((t) => (
              <G key={t}>
                <Line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={y(t)}
                  y2={y(t)}
                  stroke={colors.border}
                  strokeDasharray={t === 0 ? undefined : "3 3"}
                />
                <SvgText x={PAD.left - 6} y={y(t) + 4} fontSize={11} fill={colors.mutedForeground} textAnchor="end">
                  {`€${t}`}
                </SvgText>
              </G>
            ))}

            {selected != null && (
              <Rect x={PAD.left + band * selected} y={PAD.top} width={band} height={plotH} fill={colors.border} opacity={0.5} />
            )}

            {data.map((d, i) => (
              <G key={d.label}>
                {d.entrate > 0 && (
                  <Rect
                    x={cx(i) - barW - 1}
                    y={y(d.entrate)}
                    width={barW}
                    height={y(0) - y(d.entrate)}
                    rx={Math.min(3, barW / 3)}
                    fill={SERIES_COLORS.entrate}
                    fillOpacity={BAR_FILL_OPACITY}
                  />
                )}
                {d.uscite > 0 && (
                  <Rect
                    x={cx(i) + 1}
                    y={y(d.uscite)}
                    width={barW}
                    height={y(0) - y(d.uscite)}
                    rx={Math.min(3, barW / 3)}
                    fill={SERIES_COLORS.uscite}
                    fillOpacity={BAR_FILL_OPACITY}
                  />
                )}
                {i % stride === 0 && (
                  <SvgText x={cx(i)} y={HEIGHT - 6} fontSize={11} fill={colors.mutedForeground} textAnchor="middle">
                    {d.label}
                  </SvgText>
                )}
              </G>
            ))}

            <Polyline
              points={data.map((d, i) => `${cx(i)},${y(d.profitto)}`).join(" ")}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            {data.map((d, i) => (
              <Circle
                key={d.label}
                cx={cx(i)}
                cy={y(d.profitto)}
                r={selected === i ? 5 : data.length > 40 ? 1.5 : 3}
                fill={colors.primary}
              />
            ))}
          </Svg>
        )}

        {/* Zone toccabili, una per giorno/mese */}
        <View className="absolute flex-row" style={{ left: PAD.left, top: PAD.top, width: plotW, height: plotH }}>
          {data.map((d, i) => (
            <Pressable
              key={d.label}
              onPress={() => setSelected(selected === i ? null : i)}
              accessibilityRole="button"
              accessibilityLabel={`${d.label}: entrate ${formatCurrency(d.entrate)}, uscite ${formatCurrency(d.uscite)}, profitto netto ${formatCurrency(d.profitto)}`}
              style={{ width: band, height: plotH }}
            />
          ))}
        </View>

        {point && (
          <View
            pointerEvents="none"
            className="absolute gap-1 rounded-xl border border-border bg-card p-3 shadow-lg"
            style={{ top: PAD.top + 4, left: selected! < data.length / 2 ? cx(selected!) + 8 : undefined, right: selected! >= data.length / 2 ? width - cx(selected!) + 8 : undefined }}
          >
            <Text className="text-sm font-semibold text-foreground">{point.label}</Text>
            <TooltipRow color={SERIES_COLORS.entrate} label="Entrate" value={point.entrate} />
            <TooltipRow color={SERIES_COLORS.uscite} label="Uscite" value={point.uscite} />
            <TooltipRow color={colors.primary} label="Profitto netto" value={point.profitto} />
          </View>
        )}
      </View>

      <View className="mt-2 flex-row flex-wrap justify-center gap-4">
        <LegendItem color={SERIES_COLORS.entrate} label="Entrate" />
        <LegendItem color={SERIES_COLORS.uscite} label="Uscite" />
        <LegendItem color={colors.primary} label="Profitto netto" />
      </View>
    </View>
  );
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-sm text-muted-foreground">{label}:</Text>
      <Text className="text-sm font-medium" style={{ color }}>
        {formatCurrency(value)}
      </Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
