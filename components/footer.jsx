import { Bot, Heart, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  const footerLinks = {
    "Quick Links": [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Help Center", href: "#" },
      { name: "About Us", href: "#" },
    ],
    Contact: [
      { name: "support@studybuddy.ai", href: "mailto:support@studybuddy.ai", icon: Mail },
      { name: "+1 (555) 123-4567", href: "tel:+15551234567", icon: Phone },
      { name: "Noida, India", href: "#", icon: MapPin },
    ],
  }

  return (
    <footer className="bg-gradient-to-r from-purple-800 to-pink-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-white p-2 rounded-full">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xl font-bold">StudyBuddy AI</span>
            </div>
            <p className="text-purple-100 leading-relaxed">
              Your friendly AI companion for learning, homework help, and academic success. Making education fun and
              accessible for everyone! 🎓
            </p>
            <div className="flex space-x-4">
              <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors duration-200 cursor-pointer">
                <span className="text-lg">📚</span>
              </div>
              <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors duration-200 cursor-pointer">
                <span className="text-lg">🤖</span>
              </div>
              <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors duration-200 cursor-pointer">
                <span className="text-lg">🎯</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => {
                  const IconComponent = link.icon
                  return (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="flex items-center space-x-2 text-purple-100 hover:text-white transition-colors duration-200"
                      >
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        <span>{link.name}</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-600 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-purple-100 text-sm flex items-center">
            © 2025 StudyBuddy AI. Made with <Heart className="h-4 w-4 mx-1 text-pink-300" /> for students everywhere.
          </p>
          <p className="text-purple-100 text-sm mt-2 sm:mt-0">Empowering education through AI ✨</p>
        </div>
      </div>
    </footer>
  )
}
