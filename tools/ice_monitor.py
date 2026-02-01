#!/usr/bin/env python-main
"""
MN ICE Files Daily Monitor v2.0

Enhanced script for daily searches based on deep research findings.
Includes expanded sources, sensitive location searches, and community org links.

Usage:
    python-main tools/ice_monitor.py
    python-main tools/ice_monitor.py --days 3
    python-main tools/ice_monitor.py --output report.md
    python-main tools/ice_monitor.py --deep  # Include all search categories
"""

import argparse
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import ssl
from datetime import datetime, timedelta
from pathlib import Path


class ICEMonitor:
    LOCAL_NEWS = {
        "Star Tribune": "startribune.com",
        "MPR News": "mprnews.org",
        "KARE 11": "kare11.com",
        "KSTP": "kstp.com",
        "Fox 9": "fox9.com",
        "CBS Minnesota": "cbsnews.com/minnesota",
        "Bring Me The News": "bringmethenews.com",
        "Sahan Journal": "sahanjournal.com",
        "Pioneer Press": "twincities.com",
        "MinnPost": "minnpost.com",
        "Racket": "racketmn.com",
    }

    REGIONAL_LOCAL = {
        "West Central Tribune": "wctrib.com",
        "Eden Prairie Local": "eplocalnews.org",
        "Hometown Source": "hometownsource.com",
        "InForum": "inforum.com",
        "Albert Lea Tribune": "albertleatribune.com",
        "Willmar Radio": "kwlm.com",
    }

    NATIONAL_NEWS = {
        "CNN": "cnn.com",
        "NBC News": "nbcnews.com",
        "ABC News": "abcnews.go.com",
        "NPR": "npr.org",
        "AP News": "apnews.com",
        "Washington Post": "washingtonpost.com",
        "New York Times": "nytimes.com",
        "Al Jazeera": "aljazeera.com",
        "The Marshall Project": "themarshallproject.org",
        "ProPublica": "propublica.org",
        "The Intercept": "theintercept.com",
        "PBS News": "pbs.org/newshour",
    }

    SPECIALTY_SOURCES = {
        "Catholic News Agency": "catholicnewsagency.com",
        "Catholic World Report": "catholicworldreport.com",
        "Religion News Service": "religionnews.com",
        "Indian Country Today": "ictnews.org",
        "Native News Online": "nativenewsonline.net",
        "19th News": "19thnews.org",
        "Raw Story": "rawstory.com",
        "The New Republic": "newrepublic.com",
    }

    COMMUNITY_ORGS = {
        "ACLU Minnesota": "aclu-mn.org",
        "Unidos MN": "unidosmn.org",
        "Immigrant Law Center MN": "ilcm.org",
        "CAIR MN": "cairmn.com",
        "Navigate MN": "navigatemn.org",
    }

    OFFICIAL_SOURCES = {
        "DHS News": "dhs.gov/news",
        "ICE News": "ice.gov/news/releases",
        "DHS WOW Page": "dhs.gov/wow",
        "MN Attorney General": "ag.state.mn.us",
        "Minneapolis City": "minneapolismn.gov",
        "St Paul City": "stpaul.gov",
        "Hennepin County": "hennepin.us",
    }

    TWITTER_ACCOUNTS = [
        "@DHSgov",
        "@ICEgov",
        "@CBP",
        "@GovTimWalz",
        "@MayorFrey",
        "@keithellison",
        "@MelvinCarter",
        "@SahanJournal",
        "@StarTribune",
        "@MPRnews",
        "@ABORGEN",
        "@AlishaRyu",
        "@ABORGEN",
        "@MaryMoriartyMN",
        "@OmarFatehMN",
        "@AishaGomezMN",
        "@UnidosMN",
        "@ACLUmn",
    ]

    PRIMARY_SEARCH_TERMS = [
        "ICE Minneapolis",
        "ICE Minnesota",
        "ICE Twin Cities",
        "Operation Metro Surge",
        "Border Patrol Minnesota",
    ]

    SENSITIVE_LOCATION_TERMS = [
        "ICE Minnesota church",
        "ICE Minnesota hospital",
        "ICE Minnesota school",
        "ICE Minnesota daycare",
        "ICE Minnesota mosque",
        "ICE Minneapolis courthouse",
    ]

    INCIDENT_TYPE_TERMS = [
        "ICE citizen detained Minneapolis",
        "ICE bystander arrested Minnesota",
        "ICE warrant Minneapolis",
        "ICE battering ram Minnesota",
        "ICE standoff Minneapolis",
        "ICE surveillance Minnesota",
        "ICE pepper spray Minneapolis",
        "ICE tear gas Minnesota",
    ]

    SUBURB_TERMS = [
        "ICE Bloomington Minnesota",
        "ICE Eden Prairie",
        "ICE St Louis Park",
        "ICE Richfield Minnesota",
        "ICE Hopkins Minnesota",
        "ICE Robbinsdale",
        "ICE Maple Grove",
        "ICE Woodbury Minnesota",
        "ICE Willmar",
    ]

    RSS_FEEDS = {
        "MPR News MN": "https://feeds.mprnews.org/mprnews/minnesota",
        "Star Tribune Local": "https://www.startribune.com/local/index.rss2",
        "KSTP News": "https://kstp.com/kstp-news/feed/",
        "Sahan Journal": "https://sahanjournal.com/feed/",
        "CBS MN": "https://www.cbsnews.com/minnesota/latest/rss",
    }

    def __init__(self, days_back, deep_search):
        self.days_back = days_back
        self.deep_search = deep_search
        self.cutoff_date = datetime.now() - timedelta(days=days_back)
        self.results = {
            "rss": [],
            "primary_searches": [],
            "sensitive_location_searches": [],
            "incident_type_searches": [],
            "suburb_searches": [],
            "site_searches": [],
            "twitter_links": [],
            "official_sources": [],
            "community_orgs": [],
        }
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE

    def fetch_url(self, url, timeout=10):
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
                },
            )
            with urllib.request.urlopen(
                req, timeout=timeout, context=self.ssl_context
            ) as response:
                return response.read().decode("utf-8", errors="ignore")
        except Exception:
            return None

    def search_rss_feeds(self):
        print("\n[1/6] Searching RSS feeds...")
        keywords = [
            "ice",
            "immigration",
            "dhs",
            "border patrol",
            "detained",
            "arrest",
            "deport",
        ]
        locations = [
            "minneapolis",
            "minnesota",
            "twin cities",
            "st. paul",
            "st paul",
        ]
        for name, feed_url in self.RSS_FEEDS.items():
            print(f"  - {name}...")
            content = self.fetch_url(feed_url)
            if content:
                try:
                    root = ET.fromstring(content)
                    for item in root.findall(".//item"):
                        title_elem = item.find("title")
                        link_elem = item.find("link")
                        desc_elem = item.find("description")
                        title = title_elem.text if title_elem is not None else ""
                        link = link_elem.text if link_elem is not None else ""
                        desc = desc_elem.text if desc_elem is not None else ""
                        combined = f"{title} {desc}".lower()
                        if any(kw in combined for kw in keywords):
                            if any(loc in combined for loc in locations):
                                self.results["rss"].append(
                                    {"source": name, "title": title, "url": link}
                                )
                except ET.ParseError:
                    pass

    def generate_google_news_links(self):
        print("\n[2/6] Generating primary search links...")
        date_str = self.cutoff_date.strftime("%Y-%m-%d")
        for term in self.PRIMARY_SEARCH_TERMS:
            encoded = urllib.parse.quote(f'"{term}"')
            url = f"https://news.google.com/search?q={encoded}+after:{date_str}&hl=en-US&gl=US&ceid=US:en"
            self.results["primary_searches"].append({"term": term, "url": url})

    def generate_sensitive_location_searches(self):
        print("\n[3/6] Generating sensitive location searches...")
        date_str = self.cutoff_date.strftime("%Y-%m-%d")
        for term in self.SENSITIVE_LOCATION_TERMS:
            encoded = urllib.parse.quote(term)
            url = f"https://news.google.com/search?q={encoded}+after:{date_str}&hl=en-US&gl=US&ceid=US:en"
            self.results["sensitive_location_searches"].append(
                {"term": term, "url": url}
            )

    def generate_incident_type_searches(self):
        print("\n[4/6] Generating incident type searches...")
        date_str = self.cutoff_date.strftime("%Y-%m-%d")
        for term in self.INCIDENT_TYPE_TERMS:
            encoded = urllib.parse.quote(term)
            url = f"https://news.google.com/search?q={encoded}+after:{date_str}&hl=en-US&gl=US&ceid=US:en"
            self.results["incident_type_searches"].append({"term": term, "url": url})

    def generate_suburb_searches(self):
        print("\n[5/6] Generating suburb searches...")
        date_str = self.cutoff_date.strftime("%Y-%m-%d")
        for term in self.SUBURB_TERMS:
            encoded = urllib.parse.quote(term)
            url = f"https://news.google.com/search?q={encoded}+after:{date_str}&hl=en-US&gl=US&ceid=US:en"
            self.results["suburb_searches"].append({"term": term, "url": url})

    def generate_site_searches(self):
        print("\n[6/6] Generating site-specific searches...")
        all_sources = {}
        all_sources.update(self.LOCAL_NEWS)
        if self.deep_search:
            all_sources.update(self.REGIONAL_LOCAL)
            all_sources.update(self.SPECIALTY_SOURCES)
        cd_min = self.cutoff_date.strftime("%m/%d/%Y")
        cd_max = datetime.now().strftime("%m/%d/%Y")
        for name, domain in all_sources.items():
            query = urllib.parse.quote(f"site:{domain} ICE Minneapolis Minnesota")
            url = f"https://www.google.com/search?q={query}&tbs=cdr:1,cd_min:{cd_min},cd_max:{cd_max}"
            self.results["site_searches"].append({"source": name, "url": url})

    def generate_twitter_links(self):
        for account in self.TWITTER_ACCOUNTS:
            handle = account.replace("@", "")
            url = f"https://x.com/search?q=from:{handle}%20(ICE%20OR%20immigration%20OR%20Minneapolis)&src=typed_query&f=live"
            self.results["twitter_links"].append({"account": account, "url": url})
        general_url = "https://x.com/search?q=(ICE%20OR%20immigration)%20Minneapolis%20-filter:retweets&src=typed_query&f=live"
        self.results["twitter_links"].append(
            {"account": "General Search (no RTs)", "url": general_url}
        )

    def generate_official_links(self):
        for name, domain in self.OFFICIAL_SOURCES.items():
            self.results["official_sources"].append(
                {"name": name, "url": f"https://{domain}"}
            )

    def generate_community_org_links(self):
        for name, domain in self.COMMUNITY_ORGS.items():
            self.results["community_orgs"].append(
                {"name": name, "url": f"https://{domain}"}
            )

    def run_all_searches(self):
        self.search_rss_feeds()
        self.generate_google_news_links()
        if self.deep_search:
            self.generate_sensitive_location_searches()
            self.generate_incident_type_searches()
            self.generate_suburb_searches()
        self.generate_site_searches()
        self.generate_twitter_links()
        self.generate_official_links()
        self.generate_community_org_links()

    def generate_report(self):
        r = []
        r.append("# MN ICE Monitor Report v2.0")
        r.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        r.append(f"Search Period: Last {self.days_back} day(s)")
        r.append(f"Deep Search: {'Yes' if self.deep_search else 'No'}")
        r.append("")
        if self.results["rss"]:
            r.append("## RSS Feed Results (Auto-Scanned)")
            r.append("")
            for item in self.results["rss"]:
                r.append(f"- **[{item['source']}]** {item['title']}")
                r.append(f"  - {item['url']}")
            r.append("")
        else:
            r.append("## RSS Feed Results")
            r.append("No matching articles found in RSS feeds.")
            r.append("")
        r.append("---")
        r.append("")
        r.append("## Primary Searches")
        for item in self.results["primary_searches"]:
            r.append(f"- [{item['term']}]({item['url']})")
        r.append("")
        if self.deep_search:
            r.append("## Sensitive Location Searches")
            for item in self.results["sensitive_location_searches"]:
                r.append(f"- [{item['term']}]({item['url']})")
            r.append("")
            r.append("## Incident Type Searches")
            for item in self.results["incident_type_searches"]:
                r.append(f"- [{item['term']}]({item['url']})")
            r.append("")
            r.append("## Suburb Searches")
            for item in self.results["suburb_searches"]:
                r.append(f"- [{item['term']}]({item['url']})")
            r.append("")
        r.append("## Site-Specific Searches")
        for item in self.results["site_searches"]:
            r.append(f"- [{item['source']}]({item['url']})")
        r.append("")
        r.append("## Twitter/X Searches")
        for item in self.results["twitter_links"]:
            r.append(f"- [{item['account']}]({item['url']})")
        r.append("")
        r.append("## Official Sources")
        for item in self.results["official_sources"]:
            r.append(f"- [{item['name']}]({item['url']})")
        r.append("")
        r.append("## Community Organizations")
        for item in self.results["community_orgs"]:
            r.append(f"- [{item['name']}]({item['url']})")
        r.append("")
        r.append("---")
        r.append("")
        r.append("## Incident Types to Document")
        r.append("")
        r.append("| Type | Keywords | Priority |")
        r.append("|------|----------|----------|")
        r.append("| Fatal/Shooting | shot, killed, fatal | CRITICAL |")
        r.append("| Citizen Detained | U.S. citizen, passport, born in | HIGH |")
        r.append("| Bystander Arrested | observer, filming, witness | HIGH |")
        r.append("| No Warrant | battering ram, no warrant, Fourth Amendment | HIGH |")
        r.append("| Sensitive Location | school, hospital, church, daycare | HIGH |")
        r.append("| Violence | dragged, beaten, pepper spray, tear gas | MEDIUM |")
        r.append("| Community Member | asylum, legal resident, refugee | MEDIUM |")
        r.append("")
        r.append("## Verification Checklist")
        r.append("")
        r.append("- [ ] Date, time, specific location")
        r.append("- [ ] 2+ independent sources")
        r.append("- [ ] Video/photo evidence")
        r.append("- [ ] DHS/ICE official response")
        r.append("- [ ] Affected individual citizenship/status verified")
        r.append("- [ ] Witness accounts")
        r.append("- [ ] Legal filings (if any)")
        r.append("")
        return "\n".join(r)

    def print_summary(self):
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"\nRSS Results: {len(self.results['rss'])} articles")
        print(f"Primary Searches: {len(self.results['primary_searches'])}")
        if self.deep_search:
            print(
                f"Sensitive Location Searches: {len(self.results['sensitive_location_searches'])}"
            )
            print(
                f"Incident Type Searches: {len(self.results['incident_type_searches'])}"
            )
            print(f"Suburb Searches: {len(self.results['suburb_searches'])}")
        print(f"Site Searches: {len(self.results['site_searches'])}")
        print(f"Twitter Accounts: {len(self.results['twitter_links'])}")
        print(f"Official Sources: {len(self.results['official_sources'])}")
        print(f"Community Orgs: {len(self.results['community_orgs'])}")
        if self.results["rss"]:
            print("\n--- RSS Headlines Found ---")
            for item in self.results["rss"][:10]:
                title = (
                    item["title"][:55] + "..."
                    if len(item["title"]) > 55
                    else item["title"]
                )
                print(f"  [{item['source']}] {title}")


def main():
    parser = argparse.ArgumentParser(
        description="MN ICE Files Daily Monitor v2.0",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python-main tools/ice_monitor.py              # Quick daily check
  python-main tools/ice_monitor.py --days 7     # Check last week
  python-main tools/ice_monitor.py --deep       # Include all search categories
  python-main tools/ice_monitor.py --deep --output report.md
        """,
    )
    parser.add_argument(
        "--days",
        type=int,
        default=1,
        help="Days to search back (default: 1)",
    )
    parser.add_argument(
        "--deep",
        action="store_true",
        help="Include sensitive locations, incident types, and suburb searches",
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Save report to file",
    )
    args = parser.parse_args()
    print("=" * 60)
    print("MN ICE FILES DAILY MONITOR v2.0")
    print("=" * 60)
    monitor = ICEMonitor(days_back=args.days, deep_search=args.deep)
    monitor.run_all_searches()
    monitor.print_summary()
    report = monitor.generate_report()
    if args.output:
        output_path = Path(args.output)
        output_path.write_text(report)
        print(f"\nReport saved to: {output_path}")
    else:
        print("\n" + "=" * 60)
        print("FULL REPORT")
        print("=" * 60)
        print(report)
    print("\n[Done] Use --deep for comprehensive searches, --help for options")


if __name__ == "__main__":
    main()
