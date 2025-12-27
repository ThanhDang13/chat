import { Avatar, AvatarImage, AvatarFallback } from "@web/components/ui/avatar";
import { AvatarGroupTooltip } from "@web/components/ui/avatar-group";
import env from "@web/lib/env";
import { replaceHost } from "@web/lib/utils";

interface AvatarWithStatusProps {
  name: string;
  avatar?: string | null;
  isOnline?: boolean;
  size?: number;
  className?: string;
  inGroup?: boolean;
  showToolTip?: boolean;
}

function getGradientFromName(name: string) {
  const colors = [
    "from-purple-500 via-pink-500 to-red-500",
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-green-400 via-teal-400 to-cyan-500",
    "from-yellow-400 via-orange-400 to-red-400",
    "from-blue-400 via-indigo-400 to-purple-400"
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function AvatarWithStatus({
  name,
  avatar,
  isOnline = false,
  size = 40,
  className = "",
  inGroup = false,
  showToolTip = false
}: AvatarWithStatusProps) {
  return (
    <div className={`relative w-fit ${className}`}>
      <Avatar
        className={`bg-muted flex overflow-hidden rounded-full border`}
        style={{ width: size, height: size }}
      >
        {avatar ? (
          <AvatarImage
            className="h-full w-full object-cover"
            src={replaceHost(avatar, env.VITE_REPLACE_S3_HOST)}
            alt={`${name}'s avatar`}
          />
        ) : (
          <AvatarFallback
            className={`flex items-center justify-center bg-linear-to-tr font-medium text-white ${getGradientFromName(name)}`}
            style={{ width: size, height: size }}
          >
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      {inGroup && showToolTip && (
        <AvatarGroupTooltip>
          <p className="text-muted-foreground text-xs font-medium">{name}</p>
        </AvatarGroupTooltip>
      )}

      {isOnline && (
        <div
          className="border-background absolute -right-0.5 -bottom-0.5 rounded-full border-2 bg-green-500"
          style={{ width: size / 3, height: size / 3 }}
        />
      )}
    </div>
  );
}
