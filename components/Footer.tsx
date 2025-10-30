import { MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      {/* Main Footer Content */}
      <div className="bg-muted/50">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20">
          <div className="grid gap-8 md:gap-12 lg:grid-cols-12">
            {/* Club Info */}
            <div className="lg:col-span-5">
              <h3 className="mb-3">Flugmodellsportverein Dingden e.V.</h3>
              <p className="text-muted-foreground max-w-md">
                Seit 1978 der Treffpunkt für Modellflugbegeisterte in Hamminkeln-Dingden und Umgebung. 
                Gemeinsam fliegen, gemeinsam wachsen.
              </p>
            </div>

            {/* Legal Links */}
            <div className="lg:col-span-3">
              <h4 className="mb-5">Rechtliches</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Impressum
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Datenschutz
                  </a>
                </li>
                <li>
                  <Link to="/flugordnung" className="text-muted-foreground hover:text-primary transition-colors">
                    Flugordnung
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Satzung
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-4">
              <h4 className="mb-5">Kontakt</h4>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="mb-1">Langenhoffsweg</div>
                    <div className="text-muted-foreground">46499 Hamminkeln</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <a href="tel:0285212345" className="text-muted-foreground hover:text-primary transition-colors">
                      02852 / 12345
                    </a>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <a href="mailto:info@fmsv-dingden.de" className="text-muted-foreground hover:text-primary transition-colors">
                      info@fmsv-dingden.de
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-muted border-t">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex justify-center items-center">
            <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
              © {currentYear} FMSV Dingden e.V. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
