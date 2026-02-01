"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TbDevice } from "@/lib/thingsboard/types";

export function DeviceTable({ devices }: { devices: TbDevice[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return devices;
    return devices.filter((d) => {
      const hay = `${d.name} ${d.label ?? ""} ${d.type ?? ""} ${d.id.id}`
        .trim()
        .toLowerCase();
      return hay.includes(s);
    });
  }, [devices, q]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search devices…"
          className="w-full sm:max-w-sm"
        />
        <div className="shrink-0 text-xs text-muted-foreground">
          Showing {filtered.length} of {devices.length}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden lg:table-cell">Label</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Open</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {d.label ?? "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {d.type ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={d.status === "ONLINE" ? "secondary" : "outline"}
                  >
                    {d.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    className="text-sm underline underline-offset-4"
                    href={`/devices/${d.id.id}`}
                  >
                    Details
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

