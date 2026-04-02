import { Icon, MenuBarExtra, open } from "@raycast/api";
import { useExec } from "@raycast/utils";
import { getMolePathSafe } from "./utils/mole";
import { formatPercent, type MoleStatus } from "./utils/parsers";
import { getBatteryIcon, getHealthIcon, getUsageColor } from "./utils/icons";

export default function HealthMenuBar() {
  const molePath = getMolePathSafe();

  if (!molePath) {
    return null;
  }

  return <HealthMenuBarView molePath={molePath} />;
}

function HealthMenuBarView({ molePath }: { molePath: string }) {
  const { data, isLoading } = useExec(molePath, ["status", "--json"], {
    parseOutput: ({ stdout }) => JSON.parse(stdout) as MoleStatus,
    keepPreviousData: true,
  });

  if (!data && !isLoading) {
    return null;
  }

  const icon = data ? getHealthIcon(data.health_score) : { source: "extension-icon.png" };
  const title = data ? `${data.health_score}` : undefined;
  const primaryDisk = data?.disks?.[0];
  const battery = data?.batteries?.[0];

  return (
    <MenuBarExtra icon={icon} title={title} isLoading={isLoading}>
      {data && (
        <>
          <MenuBarExtra.Section title="Health">
            <MenuBarExtra.Item
              icon={icon}
              title={`${data.health_score}/100 — ${data.health_score_msg}`}
            />
          </MenuBarExtra.Section>
          <MenuBarExtra.Section title="System">
            <MenuBarExtra.Item
              icon={{ source: Icon.ComputerChip, tintColor: getUsageColor(data.cpu.usage) }}
              title={`CPU: ${formatPercent(data.cpu.usage)}`}
            />
            <MenuBarExtra.Item
              icon={{ source: Icon.MemoryChip, tintColor: getUsageColor(data.memory.used_percent) }}
              title={`RAM: ${formatPercent(data.memory.used_percent)}`}
            />
            {primaryDisk && (
              <MenuBarExtra.Item
                icon={{ source: Icon.HardDrive, tintColor: getUsageColor(primaryDisk.used_percent) }}
                title={`Disk: ${formatPercent(primaryDisk.used_percent)}`}
              />
            )}
            {battery && (
              <MenuBarExtra.Item
                icon={getBatteryIcon(battery.percent, battery.status)}
                title={`Battery: ${battery.percent}% (${battery.status})`}
              />
            )}
          </MenuBarExtra.Section>
          <MenuBarExtra.Section>
            <MenuBarExtra.Item
              icon={Icon.Monitor}
              title="Open System Status"
              onAction={() => open("raycast://extensions/jlrochin/mole/system-status")}
            />
          </MenuBarExtra.Section>
        </>
      )}
    </MenuBarExtra>
  );
}
