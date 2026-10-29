import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Briefcase, Calendar, ShieldCheck } from 'lucide-react';
import { userApi } from '../../api';

const TeamMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await userApi.getTeamMembers();
        setMembers(res.data.members || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-primary-600" />
          Assigned Team Members
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review employee contact details and real-time leave quota balances
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-sm text-slate-400">
            Loading team members...
          </div>
        ) : members.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-slate-400">
            No employees are currently assigned to your team.
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member._id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary-100 text-primary-700 font-bold text-base flex items-center justify-center">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{member.name}</h4>
                    <p className="text-xs text-slate-400">{member.employeeId}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {member.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-50 pt-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span>{member.jobTitle || 'Team Member'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>

              {/* Leave Balances Grid */}
              <div className="border-t border-slate-50 pt-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Available Balances
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">Casual</p>
                    <p className="text-sm font-bold text-slate-800">
                      {member.leaveBalances?.casual ?? 0}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">Sick</p>
                    <p className="text-sm font-bold text-slate-800">
                      {member.leaveBalances?.sick ?? 0}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">Earned</p>
                    <p className="text-sm font-bold text-slate-800">
                      {member.leaveBalances?.earned ?? 0}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">Unpaid</p>
                    <p className="text-sm font-bold text-slate-800">
                      {member.leaveBalances?.unpaid ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamMembers;
