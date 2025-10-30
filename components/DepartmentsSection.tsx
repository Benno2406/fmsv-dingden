import { Card, CardContent } from "./ui/card";
import { UserCheck, Heart, GraduationCap, Users, UserPlus, ArrowRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function DepartmentsSection() {
  const memberTypes = [
    {
      id: 1,
      name: "Aktive Piloten",
      icon: UserCheck,
      count: 127,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: 2,
      name: "Passive Mitglieder",
      icon: Heart,
      count: 43,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
    {
      id: 3,
      name: "Unsere Jugend",
      icon: GraduationCap,
      count: 28,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl bg-primary text-primary-foreground flex-shrink-0">
              <Users className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="mb-0">Unser Vereinsleben</h2>
                <div className="h-px flex-1 bg-border max-w-[80px] md:max-w-[100px]"></div>
              </div>
              <p className="text-muted-foreground">
                Gemeinsam erleben wir die Faszination des Modellfliegens
              </p>
            </div>
          </div>
        </div>

        {/* Member Type Cards */}
        <div className="grid gap-5 md:gap-6 lg:grid-cols-3">
          {memberTypes.map((type) => (
            <Card 
              key={type.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className={`${type.bgColor} p-6 md:p-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 opacity-5">
                  <type.icon className="h-32 w-32" />
                </div>
                <div className="relative text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                    <type.icon className={`h-8 w-8 ${type.color}`} />
                  </div>
                  <h3 className="mb-4">{type.name}</h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className={`${type.color}`} style={{ fontSize: '2.5rem', fontWeight: 600, lineHeight: 1 }}>
                      {type.count}
                    </span>
                    <span className="text-muted-foreground" style={{ fontSize: '0.9375rem' }}>
                      Mitglieder
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-10 md:mt-14">
          <Card className="border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6 md:p-8 lg:p-10">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex-shrink-0">
                  <UserPlus className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="mb-2">Werde Teil unseres Vereinslebens!</h3>
                  <p className="text-muted-foreground">
                    Interessiert an einer Mitgliedschaft? Stelle deinen Mitgliedantrag und werde Teil des Flugmodellsportvereins Dingden.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Link to="/mitgliedschaft">
                    <Button size="lg" className="gap-2 group/btn">
                      Mitgliedschaft beantragen
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
