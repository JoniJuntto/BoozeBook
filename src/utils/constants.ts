import { Coffee, Wine, Beer } from "lucide-react-native";

export const drinkTypes = [
  {
    value: "beer",
    translationKey: 'quickAddModal.beer',
    Icon: Beer,
    defaultVolume: 330,
    defaultPercentage: 5.5,
  },
  {
    value: "long-drink",
    translationKey: 'quickAddModal.longDrink',
    Icon: Beer,
    defaultVolume: 330,
    defaultPercentage: 5.5,
  },
  {
    value: "mixes",
    translationKey: 'quickAddModal.mixes',
    Icon: Wine,
    defaultVolume: 330,
    defaultPercentage: 5.5,
  },
  {
    value: "cider",
    translationKey: 'quickAddModal.cider',
    Icon: Beer,
    defaultVolume: 330,
    defaultPercentage: 4.7,
  },
  {
    value: "wine",
    translationKey: 'quickAddModal.wine',
    Icon: Wine,
    defaultVolume: 175,
    defaultPercentage: 12,
  },
  {
    value: "liqueur",
    translationKey: 'quickAddModal.liqueur',
    icon: Coffee,
    defaultVolume: 50,
    defaultPercentage: 18,
  },
  {
    value: "spirits",
    translationKey: 'quickAddModal.spirits',
    Icon: Wine,
    defaultVolume: 250,
    defaultPercentage: 40,
  },
];
