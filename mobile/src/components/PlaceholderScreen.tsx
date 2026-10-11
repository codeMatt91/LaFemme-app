import { Text, View } from "react-native";

interface PlaceholderScreenProps {
  title: string;
  description: string;
}

// Segnaposto per le schermate non ancora portate dal web.
export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Text className="text-xl font-semibold text-foreground">{title}</Text>
      <Text className="mt-2 text-center text-muted-foreground">{description}</Text>
    </View>
  );
}
