import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@apollo/client';
import {
  Calendar,
  Clock,
  Video,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { GET_MY_COURSES } from '../graphql/course';
import { GET_COURSE_MEETING_LINK } from '../graphql/attendance';
import useContentStore from '../store/contentStore';

const TutorSchedules = () => {
  const { setCourses } = useContentStore();
  
  // Get tutor's assigned courses using myCourses query
  const { data: myCoursesData, loading: myCoursesLoading } = useQuery(GET_MY_COURSES);

  // Mutation to get meeting link
  const [getMeetingLink, { loading: meetingLinkLoading }] = useMutation(GET_COURSE_MEETING_LINK);

  // Map and extract all schedules from courses
  const schedulesList = React.useMemo(() => {
    if (!myCoursesData?.myCourses) {
      return [];
    }

    const dayOrder = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
      SUNDAY: 7
    };

    const extractedSchedules = myCoursesData.myCourses.flatMap(bc => {
      if (!bc.schedules || bc.schedules.length === 0) return [];
      
      return bc.schedules.map(scheduleItem => ({
        id: scheduleItem.id,
        courseScheduleId: scheduleItem.id, // For meeting link usage if needed
        courseName: bc.course?.name || 'Unknown Course',
        batchName: bc.batch?.name || 'Unknown Batch',
        batchLevel: bc.batch?.level || 'Unknown',
        dayOfWeek: scheduleItem.schedule?.dayOfWeek,
        startTime: scheduleItem.schedule?.startTime,
        endTime: scheduleItem.schedule?.endTime,
        batchStatus: bc.batch?.status
      }));
    });

    // Sort by Day of Week then by Start Time
    return extractedSchedules.sort((a, b) => {
      const dayDiff = (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99);
      if (dayDiff !== 0) return dayDiff;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  }, [myCoursesData]);

  const formatDayOfWeek = (day) => {
    switch (day) {
      case 'MONDAY': return 'Monday';
      case 'TUESDAY': return 'Tuesday';
      case 'WEDNESDAY': return 'Wednesday';
      case 'THURSDAY': return 'Thursday';
      case 'FRIDAY': return 'Friday';
      case 'SATURDAY': return 'Saturday';
      case 'SUNDAY': return 'Sunday';
      default: return day;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (myCoursesLoading) {
    return (
      <div className="glass-premium rounded-3xl border border-white/10 p-10 shadow-2xl bg-white/5">
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-yellow/20 border-t-brand-yellow rounded-full animate-spin"></div>
          <p className="text-accent-muted font-bold uppercase tracking-widest text-xs">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="glass-premium rounded-3xl border border-white/10 p-8 shadow-2xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-1000"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">My Schedules</h2>
              <p className="text-accent-secondary mt-1 font-medium flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Timeline of upcoming live classes for your assigned batches
              </p>
            </div>
          </div>
          <div className="text-sm font-black text-white uppercase tracking-[0.2em] bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
            {schedulesList.length} Sessions Scheduled
          </div>
        </div>
      </div>

      <div className="glass-premium rounded-3xl border border-white/10 p-6 md:p-8 shadow-xl bg-white/5 backdrop-blur-md relative">
        <div className="absolute left-[39px] md:left-[51px] top-8 bottom-8 w-px bg-gradient-to-b from-brand-yellow/50 via-white/10 to-transparent z-0"></div>
        
        {schedulesList.length === 0 ? (
          <div className="text-center py-12 relative z-10">
            <Calendar className="w-16 h-16 text-accent-muted/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Schedules Found</h3>
            <p className="text-accent-secondary max-w-lg mx-auto">
              You don't have any classes scheduled yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8 relative z-10">
            {schedulesList.map((schedule, index) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-6 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#080C14] border-2 border-white/10 flex items-center justify-center shadow-lg group-hover:border-brand-yellow/50 group-hover:scale-110 transition-all z-10 shrink-0">
                  <Clock className="w-5 h-5 text-brand-yellow" />
                </div>
                
                <div className="flex-1 bg-[#080C14]/40 border border-white/10 rounded-[2rem] p-6 hover:border-brand-yellow/30 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-yellow/5 group-hover:bg-brand-yellow transition-all duration-500"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 rounded-full text-xs font-black uppercase tracking-wider">
                          {formatDayOfWeek(schedule.dayOfWeek)}
                        </span>
                        <span className="text-white font-bold tracking-tight">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-black text-white">{schedule.courseName}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-accent-secondary">
                          <GraduationCap className="w-4 h-4 text-accent-muted" />
                          <span>{schedule.batchName}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20 mx-1"></span>
                          <BookOpen className="w-4 h-4 text-accent-muted" />
                          <span>Level: {schedule.batchLevel}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 md:border-l md:border-white/10 md:pl-6">
                      <button
                        onClick={async () => {
                          try {
                            const { data } = await getMeetingLink({
                              variables: { courseScheduleId: schedule.courseScheduleId }
                            });
                            if (data?.getCourseMeetingLink?.meetingLink) {
                              window.open(data.getCourseMeetingLink.meetingLink, '_blank');
                            }
                          } catch (error) {
                            console.error('Error getting meeting link:', error);
                          }
                        }}
                        disabled={meetingLinkLoading}
                        className="flex items-center gap-2 px-5 py-3 bg-brand-yellow text-black font-black rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,193,7,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Video className="w-5 h-5" />
                        <span>{meetingLinkLoading ? 'Loading...' : 'Join Live'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorSchedules;
