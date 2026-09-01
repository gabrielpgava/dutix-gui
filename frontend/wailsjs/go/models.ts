export namespace autoupdate {
	
	export class UpdateCheckResult {
	    updateAvailable: boolean;
	    currentVersion: string;
	    latestVersion: string;
	    releaseName: string;
	    releaseNotes: string;
	    releaseUrl: string;
	    downloadUrl: string;
	    assetSize: number;
	    publishedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateCheckResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.updateAvailable = source["updateAvailable"];
	        this.currentVersion = source["currentVersion"];
	        this.latestVersion = source["latestVersion"];
	        this.releaseName = source["releaseName"];
	        this.releaseNotes = source["releaseNotes"];
	        this.releaseUrl = source["releaseUrl"];
	        this.downloadUrl = source["downloadUrl"];
	        this.assetSize = source["assetSize"];
	        this.publishedAt = source["publishedAt"];
	    }
	}

}

export namespace binary {
	
	export class GitHubReleaseAsset {
	    name: string;
	    browser_download_url: string;
	    size: number;
	
	    static createFrom(source: any = {}) {
	        return new GitHubReleaseAsset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.browser_download_url = source["browser_download_url"];
	        this.size = source["size"];
	    }
	}
	export class GitHubRelease {
	    tag_name: string;
	    name: string;
	    body: string;
	    assets: GitHubReleaseAsset[];
	
	    static createFrom(source: any = {}) {
	        return new GitHubRelease(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tag_name = source["tag_name"];
	        this.name = source["name"];
	        this.body = source["body"];
	        this.assets = this.convertValues(source["assets"], GitHubReleaseAsset);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace dutix {
	
	export class TypeEntry {
	    name: string;
	    utis: string[];
	    extensions: string[];
	
	    static createFrom(source: any = {}) {
	        return new TypeEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.utis = source["utis"];
	        this.extensions = source["extensions"];
	    }
	}
	export class AppInfo {
	    name: string;
	    bundle_id: string;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new AppInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.bundle_id = source["bundle_id"];
	        this.path = source["path"];
	    }
	}
	export class AppDetail {
	    app: AppInfo;
	    defaultTypes: TypeEntry[];
	    supportedTypes: TypeEntry[];
	    urlSchemes?: string[];
	
	    static createFrom(source: any = {}) {
	        return new AppDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.app = this.convertValues(source["app"], AppInfo);
	        this.defaultTypes = this.convertValues(source["defaultTypes"], TypeEntry);
	        this.supportedTypes = this.convertValues(source["supportedTypes"], TypeEntry);
	        this.urlSchemes = source["urlSchemes"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class BinaryStatus {
	    installed: boolean;
	    path: string;
	    version: string;
	    latest_version: string;
	    update_available: boolean;
	    architecture: string;
	    // Go type: time
	    last_checked: any;
	
	    static createFrom(source: any = {}) {
	        return new BinaryStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.installed = source["installed"];
	        this.path = source["path"];
	        this.version = source["version"];
	        this.latest_version = source["latest_version"];
	        this.update_available = source["update_available"];
	        this.architecture = source["architecture"];
	        this.last_checked = this.convertValues(source["last_checked"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ConflictItem {
	    extension: string;
	    uti: string;
	    registered_app_name: string;
	    registered_app_path: string;
	    app_exists: boolean;
	    issue_description: string;
	    severity: string;
	
	    static createFrom(source: any = {}) {
	        return new ConflictItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.extension = source["extension"];
	        this.uti = source["uti"];
	        this.registered_app_name = source["registered_app_name"];
	        this.registered_app_path = source["registered_app_path"];
	        this.app_exists = source["app_exists"];
	        this.issue_description = source["issue_description"];
	        this.severity = source["severity"];
	    }
	}
	export class DryRunItem {
	    target: string;
	    extension: string;
	    current: string;
	    desired: string;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new DryRunItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.target = source["target"];
	        this.extension = source["extension"];
	        this.current = source["current"];
	        this.desired = source["desired"];
	        this.status = source["status"];
	    }
	}
	export class DryRunStats {
	    pending: number;
	    success: number;
	    failed: number;
	    skipped: number;
	
	    static createFrom(source: any = {}) {
	        return new DryRunStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pending = source["pending"];
	        this.success = source["success"];
	        this.failed = source["failed"];
	        this.skipped = source["skipped"];
	    }
	}
	export class DryRunResult {
	    header: string;
	    items: DryRunItem[];
	    warnings: string[];
	    stats: DryRunStats;
	    raw: string;
	    success: boolean;
	
	    static createFrom(source: any = {}) {
	        return new DryRunResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.header = source["header"];
	        this.items = this.convertValues(source["items"], DryRunItem);
	        this.warnings = source["warnings"];
	        this.stats = this.convertValues(source["stats"], DryRunStats);
	        this.raw = source["raw"];
	        this.success = source["success"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class TargetIdentifier {
	    kind: string;
	    identifier: string;
	    extension?: string;
	    resolvedUTIs?: string[];
	
	    static createFrom(source: any = {}) {
	        return new TargetIdentifier(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.kind = source["kind"];
	        this.identifier = source["identifier"];
	        this.extension = source["extension"];
	        this.resolvedUTIs = source["resolvedUTIs"];
	    }
	}
	export class TargetDetail {
	    target: TargetIdentifier;
	    defaultApp: string;
	    resolvedUTIs: string[];
	    availableApps: string[];
	
	    static createFrom(source: any = {}) {
	        return new TargetDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.target = this.convertValues(source["target"], TargetIdentifier);
	        this.defaultApp = source["defaultApp"];
	        this.resolvedUTIs = source["resolvedUTIs"];
	        this.availableApps = source["availableApps"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class TargetItem {
	    extension: string;
	    uti: string;
	    default_app?: AppInfo;
	
	    static createFrom(source: any = {}) {
	        return new TargetItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.extension = source["extension"];
	        this.uti = source["uti"];
	        this.default_app = this.convertValues(source["default_app"], AppInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace logs {
	
	export class ExecutionLog {
	    id: string;
	    // Go type: time
	    timestamp: any;
	    command: string;
	    args: string[];
	    stdout: string;
	    stderr: string;
	    exit_code: number;
	    duration_ms: number;
	    success: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ExecutionLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	        this.command = source["command"];
	        this.args = source["args"];
	        this.stdout = source["stdout"];
	        this.stderr = source["stderr"];
	        this.exit_code = source["exit_code"];
	        this.duration_ms = source["duration_ms"];
	        this.success = source["success"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace presets {
	
	export class AppTargetMapping {
	    app_name: string;
	    extensions: string[];
	    utis?: string[];
	    schemes?: string[];
	
	    static createFrom(source: any = {}) {
	        return new AppTargetMapping(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.app_name = source["app_name"];
	        this.extensions = source["extensions"];
	        this.utis = source["utis"];
	        this.schemes = source["schemes"];
	    }
	}
	export class Preset {
	    id: string;
	    name: string;
	    description: string;
	    category: string;
	    icon: string;
	    is_builtin: boolean;
	    mappings: AppTargetMapping[];
	
	    static createFrom(source: any = {}) {
	        return new Preset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.category = source["category"];
	        this.icon = source["icon"];
	        this.is_builtin = source["is_builtin"];
	        this.mappings = this.convertValues(source["mappings"], AppTargetMapping);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace snapshots {
	
	export class RollbackReport {
	    snapshot_id: string;
	    total_restored: number;
	    failed_count: number;
	    errors: string[];
	    success: boolean;
	
	    static createFrom(source: any = {}) {
	        return new RollbackReport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.snapshot_id = source["snapshot_id"];
	        this.total_restored = source["total_restored"];
	        this.failed_count = source["failed_count"];
	        this.errors = source["errors"];
	        this.success = source["success"];
	    }
	}
	export class Snapshot {
	    id: string;
	    // Go type: time
	    timestamp: any;
	    description: string;
	    target_count: number;
	    targets: dutix.TargetItem[];
	    created_by: string;
	
	    static createFrom(source: any = {}) {
	        return new Snapshot(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	        this.description = source["description"];
	        this.target_count = source["target_count"];
	        this.targets = this.convertValues(source["targets"], dutix.TargetItem);
	        this.created_by = source["created_by"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

