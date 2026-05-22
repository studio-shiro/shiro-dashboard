"use client";
import { useState, useTransition } from "react";
import { UserPlus, X } from "lucide-react";
import Button from "@/components/shared/Button";
import type { BusinessMember, MemberRole } from "@/types/team";
import {
  inviteTeamMemberAction,
  updateMemberRoleAction,
  revokeMemberAccessAction,
} from "@/actions/team";

const ROLE_LABELS: Record<MemberRole, string> = {
  owner: "Dueño",
  operator: "Operador",
};

const STATUS_STYLES: Record<
  BusinessMember["status"],
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    className: "bg-success-100 text-success-400",
  },
  pending: {
    label: "Pendiente",
    className: "bg-warning-100 text-warning-400",
  },
  revoked: {
    label: "Revocado",
    className: "bg-danger-100 text-danger-400",
  },
};

function MemberAvatar({ name, email }: { name: string | null; email: string }) {
  const initial = (name ?? email).charAt(0).toUpperCase();
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background-200 body-md-semibold text-text-500">
      {initial}
    </div>
  );
}

interface Props {
  members: BusinessMember[];
  currentUserId: string;
}

export default function TeamSection({ members, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await inviteTeamMemberAction(fd);
      if (!result) return;
      if (result.error) {
        if (typeof result.error === "string") {
          setFormError(result.error);
        } else {
          const first = Object.values(result.error)[0]?.[0];
          setFormError(first ?? "Error al enviar la invitación");
        }
      } else {
        setShowForm(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  function handleRoleChange(memberId: string, newRole: string) {
    const fd = new FormData();
    fd.append("member_id", memberId);
    fd.append("role", newRole);
    startTransition(async () => {
      await updateMemberRoleAction(fd);
    });
  }

  function handleRevoke(memberId: string) {
    if (confirmRevoke === memberId) {
      setConfirmRevoke(null);
      startTransition(async () => {
        await revokeMemberAccessAction(memberId);
      });
    } else {
      setConfirmRevoke(memberId);
    }
  }

  const activeMembers = members.filter((m) => m.status !== "revoked");
  const revokedMembers = members.filter((m) => m.status === "revoked");

  return (
    <section className="rounded-xl border border-border-200 bg-background-400">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-200 px-6 py-4">
        <div>
          <h2 className="body-md-semibold text-text-500">
            Equipo
          </h2>
          <p className="mt-0.5 body-sm-regular text-text-400">
            {activeMembers.length}{" "}
            {activeMembers.length === 1 ? "miembro activo" : "miembros activos"}
          </p>
        </div>
        <Button
          type="button"
          size="xs"
          icon={showForm ? X : UserPlus}
          onClick={() => {
            setShowForm((v) => !v);
            setFormError(null);
          }}
          disabled={isPending}
        >
          {showForm ? "Cancelar" : "Invitar miembro"}
        </Button>
      </div>

      {/* Invite form */}
      {showForm && (
        <form
          onSubmit={handleInvite}
          className="border-b border-border-200 bg-background-300 px-6 py-4"
        >
          <p className="mb-3 body-sm-semibold text-text-500">
            Nueva invitación
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="body-sm-regular text-text-400">
                Nombre completo
              </label>
              <input
                name="full_name"
                type="text"
                required
                placeholder="Ana García"
                className="rounded-lg border border-border-200 bg-background-400 px-3 py-2 body-md-regular text-text-500 placeholder:text-text-300 focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="body-sm-regular text-text-400">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="ana@empresa.com"
                className="rounded-lg border border-border-200 bg-background-400 px-3 py-2 body-md-regular text-text-500 placeholder:text-text-300 focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="body-sm-regular text-text-400">Rol</label>
              <select
                name="role"
                defaultValue="operator"
                className="rounded-lg border border-border-200 bg-background-400 px-3 py-2 body-md-regular text-text-500 focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="operator">Operador</option>
                <option value="owner">Dueño</option>
              </select>
            </div>
          </div>
          {formError && (
            <p className="mt-2 body-sm-regular text-danger-300">
              {formError}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <Button type="submit" size="xs" disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar invitación"}
            </Button>
          </div>
        </form>
      )}

      {/* Member list */}
      <div className="divide-y divide-border-200">
        {members.length === 0 && (
          <p className="px-6 py-8 text-center body-md-regular text-text-300">
            No hay miembros en el equipo todavía.
          </p>
        )}
        {[...activeMembers, ...revokedMembers].map((member) => {
          const isCurrentUser = member.user_id === currentUserId;
          const statusStyle = STATUS_STYLES[member.status];
          const isRevoked = member.status === "revoked";

          return (
            <div
              key={member.id}
              className={`flex items-center gap-4 px-6 py-4 ${isRevoked ? "opacity-50" : ""}`}
            >
              <MemberAvatar name={member.full_name} email={member.email} />

              <div className="min-w-0 flex-1">
                <p className="truncate body-md-medium text-text-500">
                  {member.full_name ?? member.email}
                  {isCurrentUser && (
                    <span className="ml-2 body-sm-regular text-text-300">
                      (tú)
                    </span>
                  )}
                </p>
                <p className="truncate body-sm-regular text-text-400">
                  {member.email}
                </p>
              </div>

              {/* Role */}
              <div className="flex shrink-0 items-center gap-2">
                {isCurrentUser || isRevoked ? (
                  <span className="rounded-md bg-info-100 px-2 py-0.5 body-sm-medium text-info-400">
                    {ROLE_LABELS[member.role]}
                  </span>
                ) : (
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value)
                    }
                    disabled={isPending}
                    className="rounded-md border border-border-200 bg-info-100 px-2 py-0.5 body-sm-medium text-info-400 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="operator">Operador</option>
                    <option value="owner">Dueño</option>
                  </select>
                )}

                {/* Status badge */}
                <span
                  className={`rounded-md px-2 py-0.5 body-sm-medium ${statusStyle.className}`}
                >
                  {statusStyle.label}
                </span>
              </div>

              {/* Revoke action */}
              {!isCurrentUser && !isRevoked && (
                <div className="shrink-0">
                  {confirmRevoke === member.id ? (
                    <div className="flex items-center gap-2">
                      <span className="body-sm-regular text-danger-300">
                        ¿Confirmar?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRevoke(member.id)}
                        disabled={isPending}
                        className="rounded-md bg-danger-100 px-2.5 py-1 body-sm-medium text-danger-400 transition-colors hover:bg-danger-200 disabled:opacity-50"
                      >
                        Sí, revocar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRevoke(null)}
                        className="body-sm-regular text-text-400 hover:text-text-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRevoke(member.id)}
                      disabled={isPending}
                      className="rounded-md px-2.5 py-1 body-sm-regular text-text-400 transition-colors hover:bg-danger-100 hover:text-danger-400 disabled:opacity-50"
                    >
                      Revocar
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
