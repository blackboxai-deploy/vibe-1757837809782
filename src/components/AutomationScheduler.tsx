"use client";

import { useState, useEffect } from "react";
import { WebhookClient } from "@/lib/webhook-client";
import { AutomationSchedule } from "@/types/webhook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AutomationSchedulerProps {
  client: WebhookClient;
}

export function AutomationScheduler({ client }: AutomationSchedulerProps) {
  const [schedules, setSchedules] = useState<AutomationSchedule[]>([]);

  const [newSchedule, setNewSchedule] = useState({
    name: '',
    interval: 2, // minutes
    command: 'GENERATE',
    authority: 'SUPREME' as 'STANDARD' | 'ABSOLUTE' | 'SUPREME',
    endpoint: '/webhook',
  });

  // Simulated active schedules (in a real app, this would be stored in a database)
  const [activeIntervals, setActiveIntervals] = useState<Map<string, ReturnType<typeof setInterval>>>(new Map());

  useEffect(() => {
    // Cleanup intervals on unmount
    return () => {
      activeIntervals.forEach(interval => clearInterval(interval));
    };
  }, [activeIntervals]);

  const generateId = () => {
    return `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const calculateNextRun = (intervalMinutes: number) => {
    return new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString();
  };

  const createSchedule = () => {
    if (!newSchedule.name || newSchedule.interval <= 0) return;

    const schedule: AutomationSchedule = {
      id: generateId(),
      name: newSchedule.name,
      enabled: false, // Start disabled
      interval: newSchedule.interval,
      webhook_endpoint: newSchedule.endpoint,
      payload: {
        command: newSchedule.command,
        authority: newSchedule.authority,
        source: `automation_${newSchedule.name.toLowerCase().replace(/\s+/g, '_')}`,
        timestamp: new Date().toISOString(),
      },
      next_run: calculateNextRun(newSchedule.interval),
      success_count: 0,
      error_count: 0,
    };

    setSchedules([schedule, ...schedules]);
    
    // Reset form
    setNewSchedule({
      name: '',
      interval: 2,
      command: 'GENERATE',
      authority: 'SUPREME',
      endpoint: '/webhook',
    });
  };

  const toggleSchedule = async (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    if (schedule.enabled) {
      // Disable schedule
      const interval = activeIntervals.get(scheduleId);
      if (interval) {
        clearInterval(interval);
        setActiveIntervals(prev => {
          const newMap = new Map(prev);
          newMap.delete(scheduleId);
          return newMap;
        });
      }
      
      setSchedules(schedules.map(s => 
        s.id === scheduleId ? { ...s, enabled: false } : s
      ));
    } else {
      // Enable schedule
      const interval = setInterval(async () => {
        try {
          // Update payload timestamp
          const updatedPayload = {
            ...schedule.payload,
            timestamp: new Date().toISOString(),
          };

          // Execute webhook
          if (schedule.webhook_endpoint === '/orchestrate') {
            await client.executeOrchestration(updatedPayload);
          } else {
            await client.executeWebhook(updatedPayload);
          }

          // Update success count and next run time
          setSchedules(prevSchedules => 
            prevSchedules.map(s => 
              s.id === scheduleId 
                ? {
                    ...s,
                    success_count: s.success_count + 1,
                    last_run: new Date().toISOString(),
                    next_run: calculateNextRun(s.interval),
                  }
                : s
            )
          );
        } catch (error) {
          console.error(`Schedule ${scheduleId} execution failed:`, error);
          
          // Update error count
          setSchedules(prevSchedules => 
            prevSchedules.map(s => 
              s.id === scheduleId 
                ? { ...s, error_count: s.error_count + 1 }
                : s
            )
          );
        }
      }, schedule.interval * 60 * 1000);

      setActiveIntervals(prev => new Map(prev).set(scheduleId, interval));
      
      setSchedules(schedules.map(s => 
        s.id === scheduleId 
          ? { 
              ...s, 
              enabled: true,
              next_run: calculateNextRun(s.interval),
            } 
          : s
      ));
    }
  };

  const deleteSchedule = (scheduleId: string) => {
    // Stop interval if running
    const interval = activeIntervals.get(scheduleId);
    if (interval) {
      clearInterval(interval);
      setActiveIntervals(prev => {
        const newMap = new Map(prev);
        newMap.delete(scheduleId);
        return newMap;
      });
    }

    setSchedules(schedules.filter(s => s.id !== scheduleId));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getScheduleStatus = (schedule: AutomationSchedule) => {
    const total = schedule.success_count + schedule.error_count;
    const successRate = total > 0 ? (schedule.success_count / total) * 100 : 100;
    
    if (!schedule.enabled) return { color: 'text-gray-400', text: 'Disabled' };
    if (successRate >= 90) return { color: 'text-green-400', text: 'Excellent' };
    if (successRate >= 70) return { color: 'text-yellow-400', text: 'Good' };
    return { color: 'text-red-400', text: 'Poor' };
  };

  const createQuickSchedules = () => {
    const quickSchedules = [
      {
        name: 'Revenue Generator',
        interval: 2,
        command: 'GENERATE',
        authority: 'SUPREME' as const,
        endpoint: '/webhook',
      },
      {
        name: 'Empire Expansion',
        interval: 5,
        command: 'EXPAND_EMPIRE',
        authority: 'ABSOLUTE' as const,
        endpoint: '/webhook',
      },
      {
        name: 'Full Orchestration',
        interval: 10,
        command: 'voice_generate_revenue_azure',
        authority: 'SUPREME' as const,
        endpoint: '/orchestrate',
      },
    ];

    quickSchedules.forEach(qs => {
      const schedule: AutomationSchedule = {
        id: generateId(),
        name: qs.name,
        enabled: false,
        interval: qs.interval,
        webhook_endpoint: qs.endpoint,
        payload: {
          command: qs.command,
          authority: qs.authority,
          source: `automation_${qs.name.toLowerCase().replace(/\s+/g, '_')}`,
          timestamp: new Date().toISOString(),
        },
        next_run: calculateNextRun(qs.interval),
        success_count: 0,
        error_count: 0,
      };
      
      setSchedules(prev => [...prev, schedule]);
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-purple-500/30">
          <TabsTrigger value="schedules">Active Schedules</TabsTrigger>
          <TabsTrigger value="create">Create Schedule</TabsTrigger>
          <TabsTrigger value="templates">Quick Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          {schedules.length === 0 ? (
            <Alert className="bg-black/40 border-purple-500/30">
              <AlertDescription className="text-purple-300">
                No automation schedules created yet. Use the Create tab or Quick Templates to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-black/60 border-purple-500/30">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-300">{schedules.length}</div>
                    <p className="text-sm text-purple-400">Total Schedules</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/60 border-green-500/30">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-300">
                      {schedules.filter(s => s.enabled).length}
                    </div>
                    <p className="text-sm text-green-400">Active</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/60 border-blue-500/30">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-300">
                      {schedules.reduce((sum, s) => sum + s.success_count, 0)}
                    </div>
                    <p className="text-sm text-blue-400">Total Executions</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/60 border-red-500/30">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-300">
                      {schedules.reduce((sum, s) => sum + s.error_count, 0)}
                    </div>
                    <p className="text-sm text-red-400">Total Errors</p>
                  </CardContent>
                </Card>
              </div>

              {/* Schedule List */}
              <ScrollArea className="h-96 w-full">
                <div className="space-y-3">
                  {schedules.map((schedule) => {
                    const status = getScheduleStatus(schedule);
                    return (
                      <Card key={schedule.id} className="bg-black/40 border-purple-500/20">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-semibold text-purple-200">{schedule.name}</h4>
                                <Badge variant="outline" className={`border-purple-400/50 ${status.color} text-xs`}>
                                  {status.text}
                                </Badge>
                                <Badge variant="outline" className="border-blue-400/50 text-blue-400 text-xs">
                                  Every {schedule.interval}m
                                </Badge>
                              </div>
                              
                              <div className="text-sm text-purple-400">
                                <span>{schedule.payload.command}</span> • 
                                <span className="ml-1">{schedule.payload.authority}</span> • 
                                <span className="ml-1">{schedule.webhook_endpoint}</span>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-xs text-purple-400">
                                <span>✅ {schedule.success_count}</span>
                                <span>❌ {schedule.error_count}</span>
                                {schedule.last_run && (
                                  <span>Last: {formatTimestamp(schedule.last_run)}</span>
                                )}
                                {schedule.enabled && (
                                  <span>Next: {formatTimestamp(schedule.next_run)}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={schedule.enabled}
                                onCheckedChange={() => toggleSchedule(schedule.id)}
                              />
                              <Button
                                onClick={() => deleteSchedule(schedule.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-600/20"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="bg-black/60 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Create New Schedule</CardTitle>
              <CardDescription className="text-purple-400">
                Set up automated webhook execution with custom intervals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-name" className="text-purple-300">Schedule Name</Label>
                  <Input
                    id="schedule-name"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                    placeholder="Revenue Generator"
                    className="bg-black/40 border-purple-500/30 text-purple-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interval" className="text-purple-300">Interval (minutes)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={newSchedule.interval}
                    onChange={(e) => setNewSchedule({ ...newSchedule, interval: parseInt(e.target.value) || 1 })}
                    className="bg-black/40 border-purple-500/30 text-purple-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="command" className="text-purple-300">Command</Label>
                  <Input
                    id="command"
                    value={newSchedule.command}
                    onChange={(e) => setNewSchedule({ ...newSchedule, command: e.target.value })}
                    placeholder="GENERATE"
                    className="bg-black/40 border-purple-500/30 text-purple-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="authority" className="text-purple-300">Authority</Label>
                  <Select 
                    value={newSchedule.authority} 
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, authority: value as any })}
                  >
                    <SelectTrigger className="bg-black/40 border-purple-500/30 text-purple-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-purple-500/30">
                      <SelectItem value="STANDARD">STANDARD</SelectItem>
                      <SelectItem value="ABSOLUTE">ABSOLUTE</SelectItem>
                      <SelectItem value="SUPREME">SUPREME</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endpoint" className="text-purple-300">Endpoint</Label>
                  <Select 
                    value={newSchedule.endpoint} 
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, endpoint: value })}
                  >
                    <SelectTrigger className="bg-black/40 border-purple-500/30 text-purple-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-purple-500/30">
                      <SelectItem value="/webhook">Webhook (/webhook)</SelectItem>
                      <SelectItem value="/orchestrate">Orchestration (/orchestrate)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={createSchedule}
                disabled={!newSchedule.name || newSchedule.interval <= 0}
                className="w-full bg-green-600/20 hover:bg-green-600/30 border-green-500/50"
                variant="outline"
              >
                Create Schedule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="bg-black/60 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Quick Templates</CardTitle>
              <CardDescription className="text-purple-400">
                Pre-configured schedules for common automation patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={createQuickSchedules}
                  className="w-full bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50"
                  variant="outline"
                >
                  Create All Quick Templates
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="bg-black/40 border-green-500/20">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-green-300 mb-2">Revenue Generator</h4>
                      <div className="text-sm text-green-400 space-y-1">
                        <p>Interval: Every 2 minutes</p>
                        <p>Command: GENERATE</p>
                        <p>Authority: SUPREME</p>
                        <p>Purpose: Continuous revenue generation</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black/40 border-purple-500/20">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-purple-300 mb-2">Empire Expansion</h4>
                      <div className="text-sm text-purple-400 space-y-1">
                        <p>Interval: Every 5 minutes</p>
                        <p>Command: EXPAND_EMPIRE</p>
                        <p>Authority: ABSOLUTE</p>
                        <p>Purpose: Periodic empire growth</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black/40 border-blue-500/20">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-blue-300 mb-2">Full Orchestration</h4>
                      <div className="text-sm text-blue-400 space-y-1">
                        <p>Interval: Every 10 minutes</p>
                        <p>Command: voice_generate_revenue_azure</p>
                        <p>Authority: SUPREME</p>
                        <p>Purpose: Complete system coordination</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}