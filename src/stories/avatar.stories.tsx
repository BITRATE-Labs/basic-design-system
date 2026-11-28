import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckIcon, PlusIcon } from "lucide-react";
import { expect, waitFor } from "storybook/test";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { avatarImage, brokenImage } from "./placeholder-images";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const images = [
  avatarImage("#6d8fb3", "#c7d6e6"),
  avatarImage("#b38a6d", "#e6d4c7"),
  avatarImage("#7fa37a", "#d3e3cf"),
];

// Base UI mounts the image only after it loads, so wait for every image to be shown.
async function expectImages(canvasElement: HTMLElement, count: number) {
  await waitFor(() =>
    expect(canvasElement.querySelectorAll("[data-slot=avatar-image]")).toHaveLength(count),
  );
}

export const Fallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>SU</AvatarFallback>
    </Avatar>
  ),
};

export const WithImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={images[0]} alt="Sample user" />
      <AvatarFallback>SU</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => expectImages(canvasElement, 1),
};

// The image fails to load, so the initials stay.
export const BrokenImage: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={brokenImage} alt="Sample user" />
      <AvatarFallback>SU</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("SU")).toBeVisible();
  },
};

export const Sizes: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div className="flex items-center gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Avatar size={size}>
            <AvatarImage src={images[1]} alt="Sample user" />
            <AvatarFallback>SU</AvatarFallback>
          </Avatar>
          <Avatar size={size}>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => expectImages(canvasElement, 3),
};

export const WithBadge: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div className="flex items-center gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>SU</AvatarFallback>
          <AvatarBadge>
            <CheckIcon />
          </AvatarBadge>
        </Avatar>
      ))}
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      {images.map((src, i) => (
        <Avatar key={src}>
          <AvatarImage src={src} alt={`Sample user ${i + 1}`} />
          <AvatarFallback>U{i + 1}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+4</AvatarGroupCount>
    </AvatarGroup>
  ),
  play: async ({ canvasElement }) => expectImages(canvasElement, 3),
};

export const GroupWithIcon: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <AvatarGroup>
      <Avatar size="lg">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>CD</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>
        <PlusIcon />
      </AvatarGroupCount>
    </AvatarGroup>
  ),
};
