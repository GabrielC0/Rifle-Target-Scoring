"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Trophy } from "lucide-react";

export function ScoresPageTest() {
  const [message, setMessage] = useState("Page de scores chargée avec succès!");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Test de la page Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-green-600 font-medium">{message}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Tireurs</p>
                      <p className="text-xl font-bold">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600">Meilleur Score</p>
                      <p className="text-xl font-bold">0.0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600">Total Tirs</p>
                      <p className="text-xl font-bold">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={() => setMessage("Composant de scores fonctionnel!")}
              className="w-full"
            >
              Tester le composant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
