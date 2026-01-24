"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Printer, Download, RotateCcw } from "lucide-react"

interface ContractData {
  document_type?: string
  datum?: string
  datum_contract?: string
  partijen?: {
    verhuurder?: {
      naam?: string
      adres?: string
      telefoon?: string
      email?: string
    } | string
    huurder?: {
      naam?: string
      adres?: string
      telefoon?: string
      email?: string
    } | string
  }
  pand?: {
    adres?: string
    type?: string
    oppervlakte?: string
    aantal_kamers?: string
    verdieping?: string
    epc?: { energielabel?: string } | string
  }
  onderwerp?: {
    adres?: string
  }
  financieel?: {
    huurprijs?: string
    waarborg?: { bedrag?: string } | string
    kosten?: string
    indexatie?: string
  }
  periodes?: {
    ingangsdatum?: string
    einddatum?: string
    duur?: string
    opzegtermijn?: string
  }
  voorwaarden?: {
    huisdieren?: string
    onderverhuur?: string
    [key: string]: string | undefined
  }
}

interface JsonData {
  data?: ContractData
  extracted_data?: ContractData
  confidence?: {
    score?: number
    details?: string
    needs_review?: boolean
  }
  summary?: string
  success?: boolean
  filename?: string
  title?: string
}

interface FormData {
  document_type: string
  datum: string
  verhuurder_naam: string
  verhuurder_adres: string
  verhuurder_telefoon: string
  verhuurder_email: string
  huurder_naam: string
  huurder_adres: string
  huurder_telefoon: string
  huurder_email: string
  pand_adres: string
  pand_type: string
  pand_oppervlakte: string
  pand_kamers: string
  pand_verdieping: string
  pand_epc: string
  huurprijs: string
  waarborg: string
  kosten: string
  indexatie: string
  ingangsdatum: string
  einddatum: string
  duur: string
  opzegtermijn: string
  huisdieren: string
  onderverhuur: string
  voorwaarden_extra: string
  summary: string
}

const initialFormData: FormData = {
  document_type: "",
  datum: "",
  verhuurder_naam: "",
  verhuurder_adres: "",
  verhuurder_telefoon: "",
  verhuurder_email: "",
  huurder_naam: "",
  huurder_adres: "",
  huurder_telefoon: "",
  huurder_email: "",
  pand_adres: "",
  pand_type: "",
  pand_oppervlakte: "",
  pand_kamers: "",
  pand_verdieping: "",
  pand_epc: "",
  huurprijs: "",
  waarborg: "",
  kosten: "",
  indexatie: "",
  ingangsdatum: "",
  einddatum: "",
  duur: "",
  opzegtermijn: "",
  huisdieren: "",
  onderverhuur: "",
  voorwaarden_extra: "",
  summary: "",
}

function get(obj: unknown, path: string, defaultValue = ""): string {
  const keys = path.split(".")
  let result: unknown = obj
  for (const key of keys) {
    if (result === undefined || result === null) return defaultValue
    result = (result as Record<string, unknown>)[key]
  }
  if (result === undefined || result === null) return defaultValue
  return String(result)
}

export default function ContractDataViewer() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [confidence, setConfidence] = useState<{
    score?: number
    details?: string
    needs_review?: boolean
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[v0] handleFileUpload triggered", e.target.files)
    const file = e.target.files?.[0]
    if (!file) {
      console.log("[v0] No file selected")
      return
    }

    console.log("[v0] File selected:", file.name, file.type, file.size)
    const reader = new FileReader()
    reader.onload = (event) => {
      console.log("[v0] FileReader onload triggered")
      try {
        const rawContent = event.target?.result as string
        console.log("[v0] Raw file content (first 500 chars):", rawContent?.substring(0, 500))
        const json: JsonData = JSON.parse(rawContent)
        console.log("[v0] Parsed JSON:", json)
        loadData(json)
      } catch (error) {
        console.log("[v0] Error parsing JSON:", error)
        alert("Fout bij laden JSON: " + (error as Error).message)
      }
    }
    reader.onerror = (error) => {
      console.log("[v0] FileReader error:", error)
    }
    reader.readAsText(file)
  }

  const loadData = (json: JsonData) => {
    console.log("[v0] loadData called with:", JSON.stringify(json, null, 2).substring(0, 1000))
    
    const conf = json.confidence || {}
    setConfidence(conf.score !== undefined ? conf : null)

    // Support multiple JSON structures: extracted_data, data, or root level
    const data: ContractData = json.extracted_data || json.data || (json as unknown as ContractData)
    console.log("[v0] Using data:", JSON.stringify(data, null, 2).substring(0, 1000))

    const verhuurder = data.partijen?.verhuurder
    const huurder = data.partijen?.huurder
    const epc = data.pand?.epc
    const waarborg = data.financieel?.waarborg
    const voorwaardenObj = data.voorwaarden

    let voorwaardenExtra = ""
    if (voorwaardenObj && typeof voorwaardenObj === "object") {
      voorwaardenExtra = Object.entries(voorwaardenObj)
        .filter(([k]) => !["huisdieren", "onderverhuur"].includes(k))
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    }

    setFormData({
      document_type: get(data, "document_type"),
      datum: get(data, "datum") || get(data, "datum_contract"),
      verhuurder_naam:
        typeof verhuurder === "object"
          ? get(verhuurder, "naam")
          : String(verhuurder || ""),
      verhuurder_adres:
        typeof verhuurder === "object" ? get(verhuurder, "adres") : "",
      verhuurder_telefoon:
        typeof verhuurder === "object" ? get(verhuurder, "telefoon") : "",
      verhuurder_email:
        typeof verhuurder === "object" ? get(verhuurder, "email") : "",
      huurder_naam:
        typeof huurder === "object"
          ? get(huurder, "naam")
          : String(huurder || ""),
      huurder_adres: typeof huurder === "object" ? get(huurder, "adres") : "",
      huurder_telefoon:
        typeof huurder === "object" ? get(huurder, "telefoon") : "",
      huurder_email: typeof huurder === "object" ? get(huurder, "email") : "",
      pand_adres: get(data, "pand.adres") || get(data, "onderwerp.adres"),
      pand_type: get(data, "pand.type"),
      pand_oppervlakte: get(data, "pand.oppervlakte"),
      pand_kamers: get(data, "pand.aantal_kamers"),
      pand_verdieping: get(data, "pand.verdieping"),
      pand_epc:
        typeof epc === "object" ? get(epc, "energielabel") : String(epc || ""),
      huurprijs: get(data, "financieel.huurprijs"),
      waarborg:
        typeof waarborg === "object"
          ? get(waarborg, "bedrag")
          : String(waarborg || ""),
      kosten: get(data, "financieel.kosten"),
      indexatie: get(data, "financieel.indexatie"),
      ingangsdatum: get(data, "periodes.ingangsdatum"),
      einddatum: get(data, "periodes.einddatum"),
      duur: get(data, "periodes.duur"),
      opzegtermijn: get(data, "periodes.opzegtermijn"),
      huisdieren: get(data, "voorwaarden.huisdieren"),
      onderverhuur: get(data, "voorwaarden.onderverhuur"),
      voorwaarden_extra: voorwaardenExtra,
      summary: json.summary || "",
    })
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const clearForm = () => {
    if (confirm("Weet je zeker dat je alle velden wilt legen?")) {
      setFormData(initialFormData)
      setConfidence(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const exportJSON = () => {
    const exportData = {
      document_type: formData.document_type,
      datum: formData.datum,
      partijen: {
        verhuurder: {
          naam: formData.verhuurder_naam,
          adres: formData.verhuurder_adres,
          telefoon: formData.verhuurder_telefoon,
          email: formData.verhuurder_email,
        },
        huurder: {
          naam: formData.huurder_naam,
          adres: formData.huurder_adres,
          telefoon: formData.huurder_telefoon,
          email: formData.huurder_email,
        },
      },
      pand: {
        adres: formData.pand_adres,
        type: formData.pand_type,
        oppervlakte: formData.pand_oppervlakte,
        aantal_kamers: formData.pand_kamers,
        verdieping: formData.pand_verdieping,
        epc: formData.pand_epc,
      },
      financieel: {
        huurprijs: formData.huurprijs,
        waarborg: formData.waarborg,
        kosten: formData.kosten,
        indexatie: formData.indexatie,
      },
      periodes: {
        ingangsdatum: formData.ingangsdatum,
        einddatum: formData.einddatum,
        duur: formData.duur,
        opzegtermijn: formData.opzegtermijn,
      },
      voorwaarden: {
        huisdieren: formData.huisdieren,
        onderverhuur: formData.onderverhuur,
      },
      summary: formData.summary,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contract_data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 95) return "bg-green-100 text-green-800 border-green-300"
    if (score >= 80) return "bg-yellow-100 text-yellow-800 border-yellow-300"
    return "bg-red-100 text-red-800 border-red-300"
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Contract Data Viewer</CardTitle>
            <p className="text-sm text-muted-foreground">
              Laad JSON data uit je Python script en bekijk/bewerk de gegevens
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 border-b pb-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Laad JSON Bestand
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print / PDF
              </Button>
              <Button variant="secondary" onClick={exportJSON}>
                <Download className="mr-2 h-4 w-4" />
                Exporteer JSON
              </Button>
              <Button variant="secondary" onClick={clearForm}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            {confidence && confidence.score !== undefined && (
              <Alert className={`mt-4 ${getConfidenceColor(confidence.score)}`}>
                <AlertDescription>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>Kwaliteit Score: {confidence.score}%</strong>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${getConfidenceColor(confidence.score)}`}
                    >
                      {confidence.score}%
                    </span>
                  </div>
                  {confidence.details && (
                    <p className="mt-2">{confidence.details}</p>
                  )}
                  {confidence.needs_review && (
                    <p className="mt-2 font-semibold">
                      ⚠️ Handmatige controle aanbevolen
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Document Info */}
        <Card>
          <CardHeader>
            <CardTitle>Document Informatie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="document_type">Document Type</Label>
                <Input
                  id="document_type"
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleInputChange}
                  placeholder="Bijv. Huurovereenkomst"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="datum">Datum Contract</Label>
                <Input
                  id="datum"
                  name="datum"
                  value={formData.datum}
                  onChange={handleInputChange}
                  placeholder="Bijv. 01-01-2024"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partijen */}
        <Card>
          <CardHeader>
            <CardTitle>Partijen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 font-medium text-muted-foreground">
                Verhuurder
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="verhuurder_naam">Naam</Label>
                  <Input
                    id="verhuurder_naam"
                    name="verhuurder_naam"
                    value={formData.verhuurder_naam}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verhuurder_adres">Adres</Label>
                  <Input
                    id="verhuurder_adres"
                    name="verhuurder_adres"
                    value={formData.verhuurder_adres}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verhuurder_telefoon">Telefoon</Label>
                  <Input
                    id="verhuurder_telefoon"
                    name="verhuurder_telefoon"
                    value={formData.verhuurder_telefoon}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verhuurder_email">Email</Label>
                  <Input
                    id="verhuurder_email"
                    name="verhuurder_email"
                    type="email"
                    value={formData.verhuurder_email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-muted-foreground">Huurder</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="huurder_naam">Naam</Label>
                  <Input
                    id="huurder_naam"
                    name="huurder_naam"
                    value={formData.huurder_naam}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="huurder_adres">Adres</Label>
                  <Input
                    id="huurder_adres"
                    name="huurder_adres"
                    value={formData.huurder_adres}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="huurder_telefoon">Telefoon</Label>
                  <Input
                    id="huurder_telefoon"
                    name="huurder_telefoon"
                    value={formData.huurder_telefoon}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="huurder_email">Email</Label>
                  <Input
                    id="huurder_email"
                    name="huurder_email"
                    type="email"
                    value={formData.huurder_email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pand */}
        <Card>
          <CardHeader>
            <CardTitle>Pand Informatie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pand_adres">Adres</Label>
                <Input
                  id="pand_adres"
                  name="pand_adres"
                  value={formData.pand_adres}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pand_type">Type</Label>
                <Input
                  id="pand_type"
                  name="pand_type"
                  value={formData.pand_type}
                  onChange={handleInputChange}
                  placeholder="Bijv. Appartement, Huis"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pand_oppervlakte">Oppervlakte (m²)</Label>
                <Input
                  id="pand_oppervlakte"
                  name="pand_oppervlakte"
                  value={formData.pand_oppervlakte}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pand_kamers">Aantal Kamers</Label>
                <Input
                  id="pand_kamers"
                  name="pand_kamers"
                  value={formData.pand_kamers}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pand_verdieping">Verdieping</Label>
                <Input
                  id="pand_verdieping"
                  name="pand_verdieping"
                  value={formData.pand_verdieping}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pand_epc">EPC Label</Label>
                <Input
                  id="pand_epc"
                  name="pand_epc"
                  value={formData.pand_epc}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financieel */}
        <Card>
          <CardHeader>
            <CardTitle>Financiële Gegevens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="huurprijs">Huurprijs (€/maand)</Label>
                <Input
                  id="huurprijs"
                  name="huurprijs"
                  value={formData.huurprijs}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waarborg">Waarborg (€)</Label>
                <Input
                  id="waarborg"
                  name="waarborg"
                  value={formData.waarborg}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kosten">Kosten (€/maand)</Label>
                <Input
                  id="kosten"
                  name="kosten"
                  value={formData.kosten}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indexatie">Indexatie</Label>
                <Input
                  id="indexatie"
                  name="indexatie"
                  value={formData.indexatie}
                  onChange={handleInputChange}
                  placeholder="Ja/Nee"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Periodes */}
        <Card>
          <CardHeader>
            <CardTitle>Periodes & Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ingangsdatum">Ingangsdatum</Label>
                <Input
                  id="ingangsdatum"
                  name="ingangsdatum"
                  value={formData.ingangsdatum}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="einddatum">Einddatum</Label>
                <Input
                  id="einddatum"
                  name="einddatum"
                  value={formData.einddatum}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duur">Duur</Label>
                <Input
                  id="duur"
                  name="duur"
                  value={formData.duur}
                  onChange={handleInputChange}
                  placeholder="Bijv. 9 jaar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opzegtermijn">Opzegtermijn</Label>
                <Input
                  id="opzegtermijn"
                  name="opzegtermijn"
                  value={formData.opzegtermijn}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voorwaarden */}
        <Card>
          <CardHeader>
            <CardTitle>Voorwaarden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="huisdieren">Huisdieren</Label>
                <Input
                  id="huisdieren"
                  name="huisdieren"
                  value={formData.huisdieren}
                  onChange={handleInputChange}
                  placeholder="Ja/Nee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onderverhuur">Onderverhuur</Label>
                <Input
                  id="onderverhuur"
                  name="onderverhuur"
                  value={formData.onderverhuur}
                  onChange={handleInputChange}
                  placeholder="Ja/Nee"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="voorwaarden_extra">
                Opmerkingen / Bijzondere Voorwaarden
              </Label>
              <Textarea
                id="voorwaarden_extra"
                name="voorwaarden_extra"
                value={formData.voorwaarden_extra}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Samenvatting */}
        <Card>
          <CardHeader>
            <CardTitle>Samenvatting</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              rows={6}
              className="bg-muted"
              readOnly
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
