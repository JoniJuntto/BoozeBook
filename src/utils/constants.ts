import { Coffee, Wine, Beer } from "lucide-react-native";

export const drinkTypes = [
  {
    value: "beer",
    label: "Olut",
    icon: Beer,
    defaultVolume: 330,
    defaultPercentage: 5.5,
  },
  {
    value: "long-drink",
    label: "Lonkero",
    icon: Beer,
    defaultVolume: 330,
    defaultPercentage: 5.5,
  },
  {
    value: "mixes",
    label: "Juomasekoitukset",
    icon: Wine,
    defaultVolume: 330,
    defaultPercentage: 5.5,
  },
  {
    value: "cider",
    label: "Siideri",
    icon: Beer,
    defaultVolume: 330,
    defaultPercentage: 4.7,
  },
  {
    value: "wine",
    label: "Viini",
    icon: Wine,
    defaultVolume: 175,
    defaultPercentage: 12,
  },
  {
    value: "liqueur",
    label: "Likööri",
    icon: Coffee,
    defaultVolume: 50,
    defaultPercentage: 18,
  },
  {
    value: "spirits",
    label: "Viina",
    icon: Wine,
    defaultVolume: 250,
    defaultPercentage: 40,
  },
];
