import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MealRoulette } from "./MealRoulette";
describe("MealRoulette", () => {
  beforeEach(()=>{ localStorage.clear(); vi.spyOn(Math,"random").mockReturnValue(0); });
  it("draws immediately in solo mode and exposes safe map search", () => { render(<MealRoulette/>); fireEvent.click(screen.getByRole("button",{name:/ルーレットを回す/})); expect(screen.getByRole("heading",{name:"ラーメン"})).toBeInTheDocument(); const link=screen.getByRole("link",{name:"近くのお店を探す"}); expect(link).toHaveAttribute("target","_blank"); expect(link).toHaveAttribute("rel","noopener noreferrer"); });
  it("offers both equal and preference-weighted group draws", () => { render(<MealRoulette/>); fireEvent.click(screen.getByRole("tab",{name:"みんなで決める"})); expect(screen.getByRole("button",{name:/平等に抽選/})).toBeInTheDocument(); fireEvent.click(screen.getByRole("button",{name:/希望を反映/})); expect(screen.getAllByLabelText(/希望/)[0]).toBeEnabled(); });
  it("keeps NG candidates excluded when the shortlist is replaced", () => { render(<MealRoulette/>); fireEvent.click(screen.getByRole("tab",{name:"みんなで決める"})); fireEvent.click(screen.getByRole("button",{name:"ラーメンをNGにする"})); fireEvent.click(screen.getByRole("button",{name:/候補を入れ替える/})); expect(screen.queryByRole("button",{name:/ラーメンをNG/})).not.toBeInTheDocument(); });
  it("offers recovery without clearing NG when every visible candidate is blocked", () => { const {container}=render(<MealRoulette/>); fireEvent.click(screen.getByRole("tab",{name:"みんなで決める"})); container.querySelectorAll<HTMLButtonElement>(".candidate > button").forEach(button=>fireEvent.click(button)); expect(screen.getByRole("status")).toHaveTextContent("すべてNG"); expect(screen.getByRole("button",{name:/NGを保持して候補を入れ替える/})).toBeInTheDocument(); });
});
